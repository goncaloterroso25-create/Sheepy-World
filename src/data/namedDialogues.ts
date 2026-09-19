import { INTERACTION_MODES, type DialogueDefinition } from '../types/game';

export const MENTALIST_LISBOOOON_EVENT = 'mentalist-lisboooon-v2';
export const MENTALIST_LISBOOOON_V2_FLAG = 'mentalist-lisboooon-v2-played';

const topicDialogue = (id: string, speaker: string, portrait: string, greeting: string,
  topics: readonly { id: string; label: string; reply: string; protagonist?: string; flag?: [string,string] }[],
): DialogueDefinition => ({
  id, startNodeId:'hello', portraitKey:portrait,
  interaction:{ id, mode:INTERACTION_MODES.repeatable },
  nodes:{
    hello:{id:'hello',speaker,lines:[greeting],portraitKey:portrait,choices:topics.map(topic=>({
      id:topic.id,label:topic.label,nextId:topic.id,
      setFlag:topic.flag?{flag:topic.flag[0],value:topic.flag[1]}:undefined,
    }))},
    ...Object.fromEntries(topics.flatMap(topic=>[
      [topic.id,{id:topic.id,speaker,lines:[topic.reply],portraitKey:portrait,nextId:topic.protagonist?`bea-${topic.id}`:undefined}],
      [`bea-${topic.id}`,{id:`bea-${topic.id}`,speaker:'Protagonist',lines:[topic.protagonist??''],portraitKey:'portrait-protagonist-warm',portraitSide:'right'}],
    ])),
  },
});

export const MENTALIST_INTRO: DialogueDefinition = {
  id:'mentalist-intro',startNodeId:'lisbon-warning',portraitKey:'portrait-lisbon-serious',interaction:{id:'mentalist-intro',mode:INTERACTION_MODES.oneShot},nodes:{
    'lisbon-warning':{id:'lisbon-warning',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:["You shouldn't be here."],nextId:'jane-invitation'},
    'jane-invitation':{id:'jane-invitation',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:[
      "She's right. You should leave.",
      'Unless you happen to be observant. Then you can help.',
    ],choices:[
      {id:'curious',label:'I can help carefully.',nextId:'route-curious',setFlags:[
        {flag:'mentalist-approach',value:'curious'},{flag:'personality-sweet',value:'true'},
      ]},
      {id:'skeptical',label:'Is this remotely official?',nextId:'route-skeptical',setFlags:[
        {flag:'mentalist-approach',value:'skeptical'},{flag:'personality-cheeky',value:'true'},
      ]},
      {id:'silly',label:'Do I get a tiny badge?',nextId:'route-silly',setFlags:[
        {flag:'mentalist-approach',value:'silly'},{flag:'personality-chaotic',value:'true'},
      ]},
    ]},
    'route-curious':{id:'route-curious',speaker:'Patrick Jane',portraitKey:'portrait-jane',lines:['A shop, a hurried mess, and a story someone wants us to believe. Shall we check the details?'],nextId:'lisbon-permits'},
    'route-skeptical':{id:'route-skeptical',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:["No. That's what makes Lisbon's expression so educational."],nextId:'lisbon-permits'},
    'route-silly':{id:'route-silly',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:['Absolutely. Close your eyes and imagine a very official little badge.'],nextId:'lisbon-permits'},
    'lisbon-permits':{id:'lisbon-permits',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      "All right. You can help. Observe first, and don't touch anything without asking.",
    ],nextId:'jane-delighted'},
    'jane-delighted':{id:'jane-delighted',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:[
      'Oh, excellent. Lisbon has adopted an honorary investigator.',
    ],nextId:'lisbon-control'},
    'lisbon-control':{id:'lisbon-control',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      'Jane. We are going to establish the facts, then examine the room—',
    ],nextId:'lisboooon'},
    lisboooon:{id:'lisboooon',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:['LISBOOOOON!'],
      nextId:'lisbon-dont',onEnterEvent:MENTALIST_LISBOOOON_EVENT},
    'lisbon-dont':{id:'lisbon-dont',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:["Don't."],nextId:'honorary'},
    honorary:{id:'honorary',speaker:'Patrick Jane',portraitKey:'portrait-jane',lines:[
      "Start with the till, the cabinet, and the small trace. Your field notes will keep the details. Then we compare.",
    ],onCompleteEvent:'mentalist-honorary'},
  },
};

/** Gives saves carrying the unreliable pre-hotfix encounter flag one authored retry. */
export const MENTALIST_LISBOOOON_CALLBACK: DialogueDefinition = {
  id:'mentalist-lisboooon-callback',startNodeId:'jane-reprise',portraitKey:'portrait-jane-amused',
  interaction:{id:'mentalist-lisboooon-callback',mode:INTERACTION_MODES.repeatable},nodes:{
    'jane-reprise':{id:'jane-reprise',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:[
      'Lisbon was just explaining how delighted she is to have help.',
    ],nextId:'lisbon-corrects'},
    'lisbon-corrects':{id:'lisbon-corrects',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      'I said observe first.',
    ],nextId:'lisboooon'},
    lisboooon:{id:'lisboooon',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:['LISBOOOOON!'],
      nextId:'lisbon-dont',onEnterEvent:MENTALIST_LISBOOOON_EVENT},
    'lisbon-dont':{id:'lisbon-dont',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:["Don't."]},
  },
};

export const LISBON_DIALOGUE = topicDialogue('lisbon-talk','Teresa Lisbon','portrait-lisbon-serious',
  'Ignore the consultant. Observe first. Touch nothing you cannot put back.',[
    {id:'dealer',label:'Who was the victim?',reply:'A local curios dealer. Killed after closing. No forced entry.',protagonist:'So the room knew whoever came in.'},
    {id:'jane',label:'Is Jane always like this?',reply:'This is him being restrained.',protagonist:'That is deeply alarming.'},
  ]);

export const JANE_CASE_DIALOGUE = topicDialogue('jane-case-talk','Patrick Jane','portrait-jane-amused',
  'The room is lying. Rooms are terrible liars.',[
    {id:'start',label:'Where should I start?',reply:'With whatever looks most deliberately messy. Accidents are less tidy than people think.'},
    {id:'hypnosis',label:'Was that hypnosis?',reply:'It was optimism with hand gestures.',protagonist:'A powerful method.'},
    {id:'lisbon',label:'Lisbon looks annoyed.',reply:'That means she is concentrating. Or I moved her keys.'},
  ]);

export const MENTALIST_DEDUCTION_DIALOGUE: DialogueDefinition = {
  id:'mentalist-deduction',startNodeId:'lisbon-summary',portraitKey:'portrait-lisbon-serious',
  interaction:{id:'mentalist-deduction',mode:INTERACTION_MODES.repeatable},nodes:{
    'lisbon-summary':{id:'lisbon-summary',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      'The money stayed. We established that the display was moved after the red trace was left.',
      'What does that make the burglary?',
    ],choices:[
      {id:'wrong-theft',label:'A theft interrupted halfway.',nextId:'wrong-theft'},
      {id:'correct-staged',label:'A cover staged after the murder.',nextId:'correct-staged'},
      {id:'wrong-ghost',label:'A display moved before an accident.',nextId:'wrong-ghost'},
    ]},
    'wrong-theft':{id:'wrong-theft',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:[
      'Then the thief forgot both the money and the dust. Ambitious forgetfulness.',
      'Try again.',
    ],nextId:'lisbon-summary'},
    'wrong-ghost':{id:'wrong-ghost',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      'The trace was already there when the stand moved. That order matters.',
      'Why disturb a display, then leave the money?',
    ],nextId:'lisbon-summary'},
    'correct-staged':{id:'correct-staged',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:[
      'Exactly. The murderer knew the shop, then dressed the room as a burglary.',
    ],nextId:'lisbon-authorizes'},
    'lisbon-authorizes':{id:'lisbon-authorizes',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      'Good. Now check the object the cabinet was arranged to hide.',
    ],onCompleteEvent:'mentalist-deduction-solved'},
  },
};

export const MENTALIST_RESOLUTION_DIALOGUE: DialogueDefinition = {
  id:'mentalist-resolution',startNodeId:'handover',portraitKey:'portrait-lisbon-serious',
  interaction:{id:'mentalist-resolution',mode:INTERACTION_MODES.oneShot},nodes:{
    handover:{id:'handover',speaker:'Teresa Lisbon',portraitKey:'portrait-lisbon-serious',lines:[
      "I'm taking this to forensics. Jane, you coming?",
    ],nextId:'two-hours'},
    'two-hours':{id:'two-hours',speaker:'Patrick Jane',portraitKey:'portrait-jane-amused',lines:[
      "No. I'm going to sleep on my couch. I only got 2 HOURS last night.",
    ],nextId:'protagonist-thought'},
    'protagonist-thought':{id:'protagonist-thought',speaker:'Protagonist',portraitKey:'portrait-protagonist-warm',portraitSide:'right',lines:[
      '2 HOURS of sleep? Why did he say it like that? Is that relevant for me?',
    ],onCompleteEvent:'mentalist-case-resolved'},
  },
};

export const PORTO_ROUTE_DIALOGUE: DialogueDefinition = {
  id:'porto-route-traveller',startNodeId:'hint',interaction:{id:'porto-route-traveller',mode:INTERACTION_MODES.oneShot},
  nodes:{hint:{id:'hint',speaker:'Traveller',portraitKey:'portrait-traveller',lines:[
    'That little Porto poster by the park road? You noticed it too.',
    'The band is from Madeira. I heard the room changes completely when they play.',
  ],onCompleteEvent:'performance-madeira-clue'}},
};

export const NAMED_DIALOGUES = {
  astarion: topicDialogue('astarion-talk','Astarion','portrait-astarion','At last. Someone with the good sense to admire the scenery.',[
    {id:'scenery',label:'The scenery?',reply:'The castle, naturally. Though it does rather lack my cheekbones.',protagonist:'A structural oversight.'},
    {id:'advice',label:'Any advice?',reply:'Never let an ominous stranger rush you. Some of us put effort into being ominous.'},
  ]),
  shadowheart: topicDialogue('shadowheart-talk','Shadowheart','portrait-shadowheart','A quiet shrine. I was beginning to think those had gone out of fashion.',[
    {id:'animal',label:'Is that animal friendly?',reply:"It gave you a warning. I'd respect that. An unusual strategy, I know."},
    {id:'sit',label:'Can I sit here?',reply:"Of course. Just don't make a ceremony of keeping me company.",protagonist:'Quiet company. Understood.'},
  ]),
  daenerys: {
    ...topicDialogue('daenerys-talk','Daenerys','portrait-daenerys','Small things grow. Be careful what you teach them.',[
      {id:'dragons',label:'All three?',reply:'Always. They are family, even when they are impossible.'},
      {id:'ending',label:'Any final advice?',reply:"Don't watch the final season.",protagonist:'Noted with unusual urgency.'},
    ]),
    worldFocus: { x: 780, y: 333 },
  },
  tyrion: topicDialogue('fair-advice','Tyrion','portrait-tyrion','A wise traveller asks directions before the second cup.',[
    {id:'third',label:'And after the third?',reply:'Every road is a remarkably good idea.'},
    {id:'castle',label:'Worth visiting?',reply:'Every castle is worth visiting once. The stairs decide whether it deserves twice.'},
  ]),
  castiel: topicDialogue('castiel-talk','Castiel','portrait-castiel','Hello, Protagonist.',[
    {id:'wings',label:'Did I just see wings?',reply:'That depends on how reliable you consider your eyes.',protagonist:'Today? Questionable.'},
    {id:'car',label:'Is that your car?',reply:"No. Dean's relationship with it is unusually territorial."},
  ]),
  dean: topicDialogue('dean-talk','Dean','portrait-dean','Hey.',[
    {id:'car',label:'Nice car.',reply:"Don't touch the car."},
    {id:'music',label:'What is playing?',reply:'The good stuff. That is the complete technical answer.'},
  ]),
  sam: topicDialogue('sam-talk','Sam','portrait-sam','He was going to say hello. That was the revised version.',[
    {id:'case',label:'Working a case?',reply:'Always. Sometimes we even know which one.'},
    {id:'dean',label:'Is he always like that?',reply:'That was also the revised version.'},
  ]),
  grandma: topicDialogue('grandma-talk','Avó','portrait-grandma-warm','Olá, minha querida! Já comeste?',[
    {id:'food',label:'Ainda não.',reply:'Então comes qualquer coisa. Não se discute.',protagonist:'Sim, avó.'},
    {id:'garden',label:'O jardim está lindo.',reply:'Está bonito, sim. Mas aparece mais vezes, ouviste?'},
  ]),
  sister: topicDialogue('sister-talk',"Gonçalo's sister",'portrait-sister','If you need me, I will be right here. Dramatically unavailable.',[
    {id:'books',label:'Defending the bookshelf?',reply:'Someone has to maintain standards around here.'},
    {id:'house',label:'Everything quiet?',reply:'Suspiciously. Give it five minutes.'},
  ]),
} as const;
