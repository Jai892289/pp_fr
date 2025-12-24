
import Hashids from 'hashids';

const hashids = new Hashids(process.env.NEXT_PUBLIC_SALT, 10);

export const encrypt = (id:string) => {
    return hashids.encode(id);
}

export const decrypt = (id:string) => {
    const decoded = hashids.decode(id);
    return decoded.length > 0 ? decoded[0] : null;
}