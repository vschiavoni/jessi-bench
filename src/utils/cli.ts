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
            if (error.code === "ENOENT" && error.syscall === "connect")
                logger.error("Connection to Docker Engine failed")
            else {
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
 *  * Parse list of filtered engines/workloads.
 *   *
 *    * Accepts:
 *     *   undefined
 *      *   a single string
 *       *   an array of strings
 *        *
 *         * Examples:
 *          *   quickjs
 *           *   ["quickjs", "v8"]
 *            *   ["!v8"]
 *             *
 *              * @param items The provided values
 *               * @param all All possible values
 *                */
export function parseFilter<T extends string>(
	items: T | T[] | undefined,
	all: T[]
): T[] {
	if (!items) return all

		const values = Array.isArray(items) ? items : [items]

		const included = values.filter(id => !id.startsWith("!"))
		const excluded = values
		.filter(id => id.startsWith("!"))
		.map(id => id.slice(1) as T)

		if (excluded.length) {
			return [
				...new Set([
					...included,
					...all.filter(id => !excluded.includes(id)),
				]),
			]
		}

		return included
}
