/**
 * Virtual root of the worker host's in-memory filesystem. Kept
 * in one module so the process shim, the path/os shims, and the VFS image
 * collector cannot drift apart.
 */

/** Virtual filesystem root; `process.cwd()` and every absolute path start here. */
export const SNH_ROOT = '/snh'

/** `$SNH_HOME`: durable-state directory inside the image. */
export const SNH_HOME = `${SNH_ROOT}/home`

/** Flat, symlink-free package tree resolved by the worker module loader. */
export const SNH_NODE_MODULES = `${SNH_ROOT}/node_modules`

/** Image configuration directory: the VFS manifest and the shipped agent presets. */
export const SNH_CONFIG = `${SNH_ROOT}/config`

/** Default (empty) workspace directory. */
export const SNH_WORKSPACE = `${SNH_ROOT}/workspace`

/** Temporary directory reported by `os.tmpdir()`. */
export const SNH_TMP = `${SNH_ROOT}/tmp`
