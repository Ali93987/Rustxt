import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Construct the list of plugins.
const plugins: Plugin<any>[] = [googleAI()];

// Initialize Genkit with the plugins.
export const ai = genkit({plugins});
