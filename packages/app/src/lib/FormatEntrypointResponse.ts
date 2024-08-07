import {Exception} from 'lakutata'

export type EntrypointResponse<T = any> = {
    code: number | string
    result: any
    message: string
}

/**
 * Format entrypoint handler returns data
 * @param data
 * @constructor
 */
export function FormatEntrypointResponse<T = any>(data: T): EntrypointResponse<T> {
    let code: number | string = 0
    let message: string = ''
    if (data instanceof Exception) {
        code = data.errno
        message = data.message
    } else if (data instanceof Error) {
        code = -1
        message = data.message
    }
    return {
        code: code,
        result: code ? null : data,
        message: message
    }
}
