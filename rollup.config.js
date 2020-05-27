import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';

const pkg = require('./package.json');

export default {
	input: 'src/index.js',
	output: [{
			file: pkg.module,
			'format': 'esm'
		},
		{
			file: pkg.main,
			'format': 'umd',
			name: 'MultiStepForm'
		},
	],
	plugins: [
		svelte(),
		resolve()
	],
};