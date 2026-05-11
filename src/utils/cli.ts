import {logger} from "./logger.js"

/**
 * Wraps a command action so that errors can be caught.
 * @param action The command action
 */
export function actionWrapper(action: (...args: any[]) => void | Promise<void>) {
    return async (...args: any[]) => {
        try {
            await action(...args)
        } catch (error: any) {
            if (error.code === "ENOENT" && error.syscall === "connect") {
                logger.error("Connection to Docker Engine failed")
            } else {
                logger.error("An error occurred!")
                logger.error(error.message)
            }

            logger.debug(error)
            logger.debug(error.stack)
            process.exit(1)
        }
    }
}

/**
 * Parse list of filtered engines/workloads.
 *
 * Accepts:
 *   undefined
 *   a single string
 *   an array of strings
 *
 * Examples:
 *   quickjs
 *   ["quickjs", "v8"]
 *   ["!v8"]
 *
 * @param items The provided values
 * @param all All possible values
 */
export function parseFilter<T extends string>(
    items: T | T[] | undefined,
    all: T[],
): T[] {
    return mergeFilterSelections(items, [], all)
}

/**
 * Merge explicit CLI filters with tag-expanded selections.
 *
 * Semantics:
 *   - no explicit include and no tag selection -> all
 *   - explicit includes only -> explicit includes
 *   - tag selection only -> tag selection
 *   - explicit includes plus tag selection -> union
 *   - explicit exclusions such as "!foo" are applied last
 */
export function mergeFilterSelections<T extends string>(
    items: T | T[] | undefined,
    taggedItems: T[],
    all: T[],
): T[] {
    const values = items ? (Array.isArray(items) ? items : [items]) : []

    const included = values.filter(id => !id.startsWith("!")) as T[]
    const excluded = values
        .filter(id => id.startsWith("!"))
        .map(id => id.slice(1) as T)

    const known = new Set(all)
    const unknownIncluded = included.filter(id => !known.has(id))
    const unknownTagged = taggedItems.filter(id => !known.has(id))
    const unknownExcluded = excluded.filter(id => !known.has(id))

    for (const id of unknownIncluded) logger.warn(`Unknown item selected explicitly: ${id}`)
    for (const id of unknownTagged) logger.warn(`Unknown item selected by tag: ${id}`)
    for (const id of unknownExcluded) logger.warn(`Unknown item excluded explicitly: ${id}`)

    let base: T[]
    if (included.length === 0 && taggedItems.length === 0) {
        base = [...all]
    } else {
        base = [...new Set([...included, ...taggedItems])]
    }

    return base
        .filter(id => known.has(id))
        .filter(id => !excluded.includes(id))
        .sort((a, b) => a.localeCompare(b))
}
