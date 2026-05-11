import {existsSync, readFileSync} from "fs"
import {resolve} from "path"

export interface TagConfig {
    engines: Record<string, string[]>
    workloads: Record<string, string[]>
}

export type TagSection = "engines" | "workloads"

export const DEFAULT_TAG_CONFIG_FILE = "jessi-tags.json"

export function loadTagConfig(configPath = DEFAULT_TAG_CONFIG_FILE): TagConfig {
    const resolvedPath = resolve(PKG_ROOT, configPath)

    if (!existsSync(resolvedPath)) {
        return {engines: {}, workloads: {}}
    }

    let parsed: Partial<TagConfig>
    try {
        parsed = JSON.parse(readFileSync(resolvedPath, "utf-8"))
    } catch (error: any) {
        throw new Error(`Invalid tag configuration '${configPath}': ${error.message}`)
    }

    return {
        engines: normalizeTagMap(parsed.engines),
        workloads: normalizeTagMap(parsed.workloads),
    }
}

export function normalizeTags(tags: string | string[] | undefined): string[] {
    if (!tags) return []

    const values = Array.isArray(tags) ? tags : [tags]

    return [
        ...new Set(
            values
                .flatMap(tag => tag.split(","))
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0),
        ),
    ]
}

export function selectIdsByTags(
    allIds: string[],
    tagMap: Record<string, string[]>,
    selectedTags: string[],
): string[] {
    if (selectedTags.length === 0) return []

    const selected = new Set<string>()

    for (const id of allIds) {
        const tags = (tagMap[id] ?? []).map(tag => tag.toLowerCase())
        if (selectedTags.some(tag => tags.includes(tag))) selected.add(id)
    }

    return [...selected].sort((a, b) => a.localeCompare(b))
}

export function findUnmatchedTags(
    allIds: string[],
    tagMap: Record<string, string[]>,
    selectedTags: string[],
): string[] {
    return selectedTags.filter(tag => {
        for (const id of allIds) {
            const tags = (tagMap[id] ?? []).map(value => value.toLowerCase())
            if (tags.includes(tag)) return false
        }
        return true
    })
}

export function listKnownTags(tagMap: Record<string, string[]>): string[] {
    const tags = new Set<string>()

    for (const values of Object.values(tagMap)) {
        for (const tag of values) tags.add(tag.toLowerCase())
    }

    return [...tags].sort((a, b) => a.localeCompare(b))
}

export function getTagsForId(tagMap: Record<string, string[]>, id: string): string[] {
    return [...(tagMap[id] ?? [])].sort((a, b) => a.localeCompare(b))
}

function normalizeTagMap(tagMap: Record<string, string[]> | undefined): Record<string, string[]> {
    const normalized: Record<string, string[]> = {}

    for (const [id, tags] of Object.entries(tagMap ?? {})) {
        if (!Array.isArray(tags)) {
            throw new Error(`Tags for '${id}' must be an array of strings`)
        }

        normalized[id] = normalizeTags(tags)
    }

    return normalized
}
