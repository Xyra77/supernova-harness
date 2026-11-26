/** Private built entry for retained Node evaluations. */
import { openInheritedControlChannel } from '@supernova-ai/snh-subprocess/control'
import { runPersistentMain } from './persistent-process.ts'

void runPersistentMain(openInheritedControlChannel(), Number(process.argv[2]), process)
