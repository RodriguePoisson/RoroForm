import * as esbuild from 'esbuild';

/*
 * Build des assets JS de RoroForm.
 *
 * Le package n'utilise PAS de bundler classique : chaque fichier source est
 * minifie INDIVIDUELLEMENT vers resources/js/dist/<Nom>.min.js, car les vues
 * Blade (helper / select-helper / file-helper) injectent inline le contenu de
 * ces fichiers par NOM exact. Les classes/fonctions sont des globales partagees
 * entre plusieurs <script> inlines (RoroElement, Input, Selectable, ...), donc :
 *   - bundle:false           -> on garde un fichier de sortie par fichier source
 *   - minifyIdentifiers:false -> on NE renomme PAS les identifiants, sinon les
 *                                references croisees entre fichiers casseraient
 *
 * Usage :
 *   npm run build    -> minifie une fois
 *   npm run watch    -> reconstruit a chaque sauvegarde (dev)
 */

const SRC = 'resources/js';
const DIST = 'resources/js/dist';

// IMPORTANT : ne pas renommer les fichiers de sortie (charges par nom dans les blades).
const entries = [
    { in: `${SRC}/Models/RoroElement.js`, out: `${DIST}/RoroElement.min.js` },
    { in: `${SRC}/Models/Input.js`, out: `${DIST}/Input.min.js` },
    { in: `${SRC}/global.js`, out: `${DIST}/global.min.js` },
    { in: `${SRC}/form.js`, out: `${DIST}/form.min.js` },
    { in: `${SRC}/inputs.js`, out: `${DIST}/inputs.min.js` },
    { in: `${SRC}/facade.js`, out: `${DIST}/facade.min.js` },
    { in: `${SRC}/Models/Selectable.js`, out: `${DIST}/Selectable.min.js` },
    { in: `${SRC}/select.js`, out: `${DIST}/select.min.js` },
    { in: `${SRC}/Models/RoroFile.js`, out: `${DIST}/RoroFile.min.js` },
    { in: `${SRC}/file.js`, out: `${DIST}/file.min.js` },
];

const options = {
    bundle: false,
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
    legalComments: 'none',
};

const watch = process.argv.includes('--watch');

if (watch) {
    const contexts = await Promise.all(
        entries.map((e) => esbuild.context({ entryPoints: [e.in], outfile: e.out, ...options }))
    );
    await Promise.all(contexts.map((c) => c.watch()));
    console.log('watch actif : resources/js/dist se regenere a chaque modif des sources JS. Ctrl+C pour arreter.');
} else {
    await Promise.all(
        entries.map((e) => esbuild.build({ entryPoints: [e.in], outfile: e.out, ...options }))
    );
    console.log(`OK : ${entries.length} fichiers minifies vers ${DIST}/`);
}
