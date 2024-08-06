import {Config} from './config/Config'
import {Application} from 'lakutata'
import {Logger} from 'lakutata/com/logger'
import {DevNull} from 'lakutata/helper'
import path from 'node:path'

Application
    .env({
        MODE: 'production'
    })
    .alias({
        // '@webroot': path.resolve(require('web').default, './dist')
    })
    .run(Config)
    .onFatalException((error: Error, logger: Logger): void => logger.error('A fatal error occurred in the program: %s', error.message))
    .onUncaughtException((error: Error & any, logger: Logger): void => error.code === 'EPIPE' ? DevNull(error) : logger.error('UncaughtError occurred: %s', error.message))

