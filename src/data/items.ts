import type { ItemDefinition } from '../types/game';
import { FESTIVAL_CURIOS } from './festivalContent';

export const TEST_ITEM_ID = 'prototype-brass-bell';

export const ITEMS: Readonly<Record<string, ItemDefinition>> = {
  'protagonist-keepsake-badge':{id:'protagonist-keepsake-badge',name:"Protagonist's keepsake Badge",description:'Someone special is very proud of you',glyph:'*',iconKey:'item-keepsake-badge',kind:'OBJECT',annotation:'Small card. Huge pride.'},
  'hydromel-horn-cup': { id:'hydromel-horn-cup', name:'Hydromel Horn Cup', description:'Tiny feast. Dramatic handle.', glyph:'*', iconKey:'item-hydromel-cup', kind:'OBJECT' },
  'hollow-knight-shirt': { id:'hollow-knight-shirt', name:'Hollow Knight Shirt', description:'A small knight. Excellent company.', glyph:'*', iconKey:'item-hollow-shirt', kind:'CLOTHES', annotation:'Wearable one day. Kept safe for now.' },
  ...Object.fromEntries(FESTIVAL_CURIOS.map(item => [item.id, { id: item.id, name: item.title,
    description: item.description, iconKey: item.iconKey, glyph: '*', kind: 'OBJECT' as const, annotation: 'Optional curiosity.' }])),
  'half-glasses': {
    id: 'half-glasses', name: 'Half Glasses',
    description: 'Durability: 50%.', glyph: '!', iconKey: 'item-half-glasses', kind: 'OBJECT',
  },
  'naruto-shuriken-keychain': {
    id: 'naruto-shuriken-keychain', name: 'Naruto Shuriken Keychain',
    description: 'Stealth level: keys jingling.', glyph: '*', iconKey: 'item-naruto-shuriken-keychain',
    kind: 'OBJECT', annotation: "One of Gonçalo's first gifts.",
  },
  [TEST_ITEM_ID]: {
    id: TEST_ITEM_ID,
    name: 'Tiny Brass Bell',
    description: 'A bell with nothing to say. For once.',
    glyph: '◇',
    iconKey: 'artifact',
    annotation: 'Noise complaints: zero.',
  },
};
