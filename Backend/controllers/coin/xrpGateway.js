// import package
import { isValidXAddress } from 'ripple-address-codec'


// import lib
import isEmpty from '../../lib/isEmpty';

export const isAddress = (address) => {
    try {
        if (isEmpty(address)) {
            return false
        }
        return isValidXAddress(address)
    } catch (err) {
        return false
    }
}