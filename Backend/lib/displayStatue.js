export const paymentType = (type) => {
    switch (type) {
        case "coin_deposit": return "Coin";
        case "coin_withdraw": return "Coin";
        case "fiat_deposit": return "Fiat";
        case "fiat_withdraw": return "Fiat";
        default: return type
    }
}