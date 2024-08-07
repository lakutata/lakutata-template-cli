import process from 'node:process'

/**
 * Notify cli entry if it is not running on stdioHosting mode
 * @constructor
 */
export async function BootNotification(): Promise<void> {
    if (process.send) process.send('READY')
}
