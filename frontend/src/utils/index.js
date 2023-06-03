import {ERC20_DECIMALS} from "./constants";
import axios from "axios";

// format a wallet address
export const truncateAddress = (address) => {
    if (!address) return
    return address.slice(0, 5) + "..." + address.slice(address.length - 4, address.length);
}

// convert from big number
export const formatBigNumber = (num) => {
    if (!num) return
    return num.shiftedBy(-ERC20_DECIMALS).toFixed(2);
}

export const getSpec = async(index) => {
    return await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/getratings?index=${index}`).then(function (response) {
        return response.data;
    });
}

export const getAddressSpec = async(address) => {
    return await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/getratings?address=${address}`).then(function (response) {
        return response.data;
    });
}

export const setLike = async(index, address, callback) => {
    await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/setrating?address=${address}&action=like&index=${index}`).then(receipt => {
        callback();
    });
}

export const setDislike = async(index, address, callback) => {
    await axios.get(`https://simplistic-valiant-hemisphere.glitch.me/setrating?address=${address}&action=dislike&index=${index}`).then(receipt => {
        callback();
    });
}