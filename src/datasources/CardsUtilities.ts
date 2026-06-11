import camelcaseKeys from "camelcase-keys";

import fs  from "fs";

import { MGCard, MGCards, MGSet } from "../types";

export class CardsUtilities {
    card = (data: any): MGCard => {
        const cardData = camelcaseKeys(data, { deep: true });
        const card = Array.isArray(cardData) ? cardData[0] : cardData;
        this.formatCard(card, card.set, card.set.language?.code);
        return card;
    }

    cards = (data: any[]): MGCards => {
        let cardsData = camelcaseKeys(data, { deep: true });
        cardsData.forEach((card, _) => {
            this.formatCard(card, card.set, card.set.language?.code);
        });
        
        return {
            count: cardsData.length,
            cards: cardsData
        };
    }

    search = (data: any[]): MGCard[] => {
        let cardsData: MGCard[] = [];
        cardsData.forEach((card, _) => {
            let cardData = camelcaseKeys(card, { deep: true });
            this.formatCard(cardData, cardData.set, cardData.language?.code);
            cardsData.push(cardData);
        });
        
        return cardsData;
    }

    cardArray = (data: any[]): MGCards => {
        let cardsData: any[] = [];

        data.forEach((card, _) => {
            let cardData = camelcaseKeys(card, { deep: true });
            this.formatCard(cardData, cardData.set, cardData.set.language?.code);
            cardsData.push(cardData);
        });
        
        return {
            count: cardsData.length,
            cards: cardsData
        };
    }

    formatCard = (card: MGCard, set: MGSet, language = "en"): MGCard => {
        this.updateImageURLs(card, set, language);

        card.displayManaCost = card.faces !== undefined && card.faces !== null && card.faces.length > 0 ?
            card.faces.map(face => face.manaCost ?? " ").join(" // ") :
            card.manaCost ?? " ";

        card.displayName = card.language?.code === "en" ? 
            card.name : 
            (card.printedName !== null && card.printedName !== undefined ? card.printedName : card.name);

        card.displayPowerToughness = (card.power !== null && card.power !== undefined) || (card.toughness !== null && card.toughness !== undefined) ?
            `${card.power}/${card.toughness}` :
            undefined;

        if (card.faces !== undefined && card.faces !== null && card.faces.length > 0) {
            const face0 = card.faces[0];
            card.displayTypeLine = face0.language?.code === "en" ?
                face0.typeLine :
                (face0.printedTypeLine !== null && face0.printedTypeLine !== undefined ? face0.printedTypeLine : face0.typeLine);
        } else {
            card.displayTypeLine = card.language?.code === "en" ?
                card.typeLine :
                (card.printedTypeLine !== null && card.printedTypeLine !== undefined ? card.printedTypeLine : card.typeLine);
        }

        if (card.releasedAt !== null && card.releasedAt !== undefined) {
            const date = new Date(card.releasedAt);
            card.releasedAt = date.toISOString().split("T")[0];
        }

        if (set.code === "tsb") {
            card.keyruneColor = "652978"; // purple
        } else {
            if (card.rarity?.name === "Common") {
                card.keyruneColor = "1A1718"; // black
            } else if (card.rarity?.name === "Uncommon") {
                card.keyruneColor = "707883"; // gray
            } else if (card.rarity?.name === "Rare") {
                card.keyruneColor = "A58E4A"; // gold
            } else if (card.rarity?.name === "Mythic") {
                card.keyruneColor = "BF4427"; // red
            } else if (card.rarity?.name === "Special") {
                card.keyruneColor = "BF4427"; // red
            } else if (card.rarity?.name === "Timeshifted") {
                card.keyruneColor = "652978"; // purple
            } else if (card.rarity?.name === "Basic Land") {
                card.keyruneColor = "000000"; // black
            }
        }

        if (card.colors === undefined || card.colors === null) {
            card.colors = [];
        }

        if (card.faces !== undefined && card.faces !== null) {
            card.faces.forEach((face, _) => {
                this.formatCard(face, set, language);
            });
        } else {
            card.faces = [];
        }

        if (card.componentParts !== undefined && card.componentParts !== null) {
            card.componentParts.forEach((componentPart, _) => {
                this.formatCard(componentPart.card, set, language);
            });
        } else {
            card.componentParts = [];
        }

        if (card.otherPrintings !== undefined && card.otherPrintings !== null) {
            card.otherPrintings.forEach((printing, _) => {
                this.formatCard(printing, set, language);
            });
        } else {
            card.otherPrintings = [];
        }

        if (card.otherLanguages !== undefined && card.otherLanguages !== null) {
            card.otherLanguages.forEach((otherLanguage, _) => {
                this.formatCard(otherLanguage, set, language);
            });
        } else {
            card.otherLanguages = [];
        }

        if (card.variations !== undefined && card.variations !== null) {
            card.variations.forEach((variation, _) => {
                this.formatCard(variation, set, language);
            });
        } else {
            card.variations = [];
        }

        return card;
    }

    updateImageURLs = (card: MGCard, set: MGSet, language = "en"): MGCard => {
        // if (card.newId !== null && card.newId !== undefined) {
        //     const soonUrl    = "/images/cards/soon.jpg"
        //     const array = card.newId.split("_")
        //     const number = array.length == 3 ? array[2] : `${array[2]}_${array[3]}`;

            
            
        //     card.artCropUrl = `${process.env.IMAGE_SERVER_URL}/images/cards/${set.code}/${language}/${number}/art_crop.jpg`;
        //     card.normalUrl = `${process.env.IMAGE_SERVER_URL}/images/cards/${set.code}/${language}/${number}/normal.jpg`;
        //     card.pngUrl = `${process.env.IMAGE_SERVER_URL}/images/cards/${set.code}/${language}/${number}/png.png`;
        // }

        if (card.faces !== undefined && card.faces !== null && card.faces.length > 0) {
            if (card.faces[0].artCropUrl !== null && card.faces[0].artCropUrl !== undefined) {
                card.artCropUrl = card.faces[0].artCropUrl;
            }
            if (card.faces[0].normalUrl !== null && card.faces[0].normalUrl !== undefined) {
                card.normalUrl = card.faces[0].normalUrl;
            }
            if (card.faces[0].pngUrl !== null && card.faces[0].pngUrl !== undefined) {
                card.pngUrl = card.faces[0].pngUrl;
            }
        }

        return card;
    }

    replaceImageURLs = (card: MGCard, faces: MGCard[]) => {
        const soonUrl    = "/images/cards/soon.jpg"

        try {
            if (faces != null && faces.length > 0) {
                for (var i=0; i<faces.length; i++) {
                    let artCropUrlOrig = "/images/cards/" + this.newId2Path(card.newId) + "/art_crop.jpg"
                    let normalUrlOrig  = "/images/cards/" + this.newId2Path(card.newId) + "/normal.jpg"
                    let pngUrlOrig     = "/images/cards/" + this.newId2Path(card.newId) + "/png.png"

                    let artCropUrl = "/images/cards/" + this.newId2Path(faces[i].newId) + "/art_crop.jpg"
                    let normalUrl  = "/images/cards/" + this.newId2Path(faces[i].newId) + "/normal.jpg"
                    let pngUrl     = "/images/cards/" + this.newId2Path(faces[i].newId) + "/png.png"

                    let artCropUrl_0 = "/images/cards/" + this.newId2Path(faces[i].newId) + "_0/art_crop.jpg"
                    let normalUrl_0  = "/images/cards/" + this.newId2Path(faces[i].newId) + "_0/normal.jpg"
                    let pngUrl_0     = "/images/cards/" + this.newId2Path(faces[i].newId) + "_0/png.png"

                    // if (fs.existsSync("./public/" + artCropUrlOrig)) {
                        faces[i].artCropUrl = artCropUrlOrig
                    // } else if (fs.existsSync("./public/" + artCropUrl)) {
                        faces[i].artCropUrl = artCropUrl
                    // } else if (fs.existsSync("./public/" + artCropUrl_0)) {
                        faces[i].artCropUrl = artCropUrl_0
                    // } else {
                        faces[i].artCropUrl = soonUrl
                    // }

                    // if (fs.existsSync("./public/" + normalUrlOrig)) {
                        faces[i].normalUrl = normalUrlOrig
                    // } else if (fs.existsSync("./public/" + normalUrl)) {
                        faces[i].normalUrl = normalUrl
                    // } else if (fs.existsSync("./public/" + normalUrl_0)) {
                        faces[i].normalUrl = normalUrl_0
                    // } else {
                        faces[i].normalUrl = soonUrl
                    // }

                    // if (fs.existsSync("./public/" + pngUrlOrig)) {
                        faces[i].pngUrl = pngUrlOrig
                    // } else if (fs.existsSync("./public/" + pngUrl)) {
                        faces[i].pngUrl = pngUrl
                    // } else if (fs.existsSync("./public/" + pngUrl_0)) {
                        faces[i].pngUrl = pngUrl_0
                    // } else {
                        faces[i].pngUrl = soonUrl
                    // }
                }            
            }
        } catch(err) {
            console.error(err)
        }
    }

    newId2Path = (newId: string | null | undefined) => {
        let path = newId ? newId : ""

        if (path.length > 0) {
            if ((path.match(/_/g) || []).length > 2) {
                path = path.replaceAll("_", "/")
                let index = path.lastIndexOf("/")
                path = path.substring(0, path.lastIndexOf("/")) + "_" + path.substring(index+1)
            } else {
                path = path.replaceAll("_", "/")
            }   
        }

        return path
    }
}
            