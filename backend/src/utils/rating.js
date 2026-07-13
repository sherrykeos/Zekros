export function getRatingType(boardSize) {
    const ratingTypes = {
        3: "RANKED_3X3",
        4: "RANKED_4X4",
        5: "RANKED_5X5",
        6: "RANKED_6X6",
    };

    const ratingType = ratingTypes[boardSize];

    if (!ratingType) {
        throw new Error(`Unsupported board size: ${boardSize}`);
    }

    return ratingType;
}