import type { SockColorKey } from '../types/designer';

export const sockImages: Record<SockColorKey, { right: string }> = {
  white: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/SickFit136.jpg?v=1743533735',
  },
  black: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/BlackSocks.png?v=1758901535',
  },
  red: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/RedSocks.png?v=1758902046',
  },
  creme: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/Creme_-_Copy.png?v=1750702945',
  },
  pink: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/Pink_Socks.png?v=1755017673',
  },
  blue: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/Blue_Socks.png?v=1756078045',
  },
  gray: {
    right: 'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/GraySocks.png?v=1756078508',
  },
};

export const colorHexByKey: Record<SockColorKey, string> = {
  white: '#FFFFFF',
  black: '#000000',
  red: '#E72027',
  blue: '#172B85',
  gray: '#939393',
  creme: '#E4D2B5',
  pink: '#EF97B6',
};

export const colorNameByKey: Record<SockColorKey, string> = {
  white: 'White',
  black: 'Black',
  red: 'Red',
  blue: 'Blue',
  gray: 'Gray',
  creme: 'Creme',
  pink: 'Pink',
};

export const colorOrder: SockColorKey[] = [
  'white',
  'black',
  'red',
  'blue',
  'gray',
  'creme',
  'pink',
];

export const overlayTemplateUrl =
  'https://cdn.shopify.com/s/files/1/0582/5324/6628/files/TemplateSock.png?v=1756076713';
