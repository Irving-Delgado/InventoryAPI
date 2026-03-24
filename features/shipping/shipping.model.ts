export type CreateShippingBody = {
    label?: string;
    street:string;
    city:string;
    state:string;
    zip:string;
    country:string;
    isDefault?: boolean;
};