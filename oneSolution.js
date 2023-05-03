//J'importe les modules file systems & path, ainsi que le fichier de paramétrage du répertoire à analyser.
import folderPath from "./folderPath.js";
import fs from "node:fs/promises";
import path from "node:path";



const app = {

    //lancement de l'application
    async init() { 
        //Je gère l'éventualité d'une erreur avec un try/catch.
        try {
            //Paramètrage du répertoire que l'on souhaite analyser la fonction getExtAndSize.
            // const folderPath = './playground';
            const { size, ext } = await app.getExtAndSize(folderPath);
            
            //Je console loggue et j'utilise un template littéral pour afficher ext 
            //(auquel j'applique join pour associer toutes les valeurs obtenues séparées par une virgule)
            //Idem pour Size.
            console.log(`Extensions: ${ext.join(', ')}`);
            console.log(`Size: ${size} bytes`);
            
            } catch (error) {
                console.log(error);
        }
    },

    //Fonction asynchrone qui permet de lire le contenu d'un répertoire de façon récursive afin de récupérer les extensions et la taille totale de son contenu.
    async getExtAndSize(folderPath) {

            try {
            //J'initialise des variables dans lesquelles je vais stocker par la suite les extensions et la taille totale.
            let totalSize = 0; // la taille initiale est 0.
            let exts = new Set(); //new Set() permet de créer un nouveau 'set objet' dans lequel on peut stocker un ensemble de valeurs uniques telles que des primitives ou des objets.
            
            //files utilise la méthode readdir du module fs qui permet de lire le contenu d'un dossier
            //donné dans la variable folderPath.
            //Afin de renvoyer un tableau d'objet fs.Dirent et pas une string des noms des fichiers
            //on passe le second argument { withFileTypes: true }
            const files = await fs.readdir(folderPath, { withFileTypes: true });

            //Je boucle sur chaque élément récupéré dans files.
            for (const file of files) {
                //filepath utilise la méthode join du module path importé plus haut.
                //Cette méthode permet de concaténer automatiquement le chemin du répertoire (folderPath) avec le nom du fichier (file.name)
                const filePath = path.join(folderPath, file.name);

                //La méthode isDirectory permet de vérifier si on est en présence d'un répertoire (true est alors renvoyé) ou d'un fichier (elle renvoit alors false).
                if (file.isDirectory()) {
                    //Si file est un dossier, j'utilise le destructuring pour récupérer un obj contenant la taille et l'ext de filePath
                    //En appelant de façon récursive la fonction getExtAndSize.
                    const { size, ext } = await app.getExtAndSize(filePath);

                    //J'ajoute à la variable totalSize la taille size de l'élément.
                    totalSize += size;

                    //Je boucle sur ext et j'ajoute à ma variable exts chaque élément récupéré avec la méthode add.
                    for (let i = 0; i < ext.length; i++) {
                        exts.add(ext[i]);
                    }

                } else { //Sinon on aborde le cas où file est un fichier
                    // La méthode Promise.all permet d'enchainer deux opérations asynchrones en parallèle.
                    //fs.stats permet de récupérer les informations de l'elmt filePath.
                    //la méthode extName du module path renvoie l'extension à partir du dernier '.' jusqu'à la fin de la string dasn la dernière portion du chemin.
                    //je récupère donc l'extension grâce à file.name obtenu grâce à fs.readdir de const files.
                    const [{ size }, fileExt] = await Promise.all([fs.stat(filePath), path.extname(file.name)]);
                    //size est extrait grâce au destructuring car il provient d'un objet contenant plusieurs propriétés obtenu avec la méthode fs.stat
                    //fileExt lui est un ensemble d'éléments uniques. C'est un tableau. J'uitliserai le spread operator plus bas.
                    totalSize += size;
                    exts.add(fileExt);
                }
            }
            return { ext: [...exts], size: totalSize };

            } catch (error) {
                console.log(error);
        }
    }
}

app.init();