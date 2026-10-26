export function nextMove({learner_text='',previous_move=null,recent_entries=[]}={}){
 const text=learner_text.trim();let move='develop_meaning';
 const coaches=recent_entries.filter(e=>e.role==='coach').slice(-2);
 const echoPrompt=/\b(?:say (?:it|that|this|the whole|the sentence)|try (?:it|that|again|saying)|repeat|one more time|once (?:more|smoothly)|put it (?:all )?(?:together|back))\b/iu;
 const repeatedCorrection=coaches.length===2&&coaches.every(e=>echoPrompt.test(e.text));
 if(/^(?:ok(?:ay)?[,. ]*)?(?:(?:let'?s|can we|i want to)\s+)?(?:stop(?: here| now| the (?:lesson|test(?:ing)?))?|pause(?: here| now)?|finish(?: for today)?)[.!? ]*$|\bi (?:need|have) to (?:go|leave)\b|\bi.?m done for today\b/iu.test(text))move='respect_stop';
 else if(/\b(?:what else|anything else|another topic|talk about something else|change (?:the )?topic|move on|what(?:['’]s| is) next|something (?:for )?next|not finish(?:ed)?)\b|\b(?:something|anything)\b.*\b(?:need to do|left to do)\b|还有什么|聊别的|接下来/iu.test(text))move='advance_idea_or_topic';
 else if(/\b(?:no idea|don.t know|not sure|don.t understand)\b|不懂|不知道/iu.test(text))move='give_brief_foothold';
 else if(/\b(?:i felt|but|because|and i|i want to)\s*[,.…-]*$/iu.test(text))move='allow_continuation';
 else if(repeatedCorrection)move='ask_content_followup';
 else if(/\b(?:video games?|playing games?|played a game|gaming|tarkov|puzzle game|escape simulator)\b/iu.test(text))move='explore_game_interest';
 else if(previous_move==='recast'||previous_move==='model')move='ask_content_followup';
 return{move,force_echo:false,force_one_sentence:false,repetition_warning:repeatedCorrection,praise_basis:'specific demonstrated meaning only; never label an unresolved form perfect',guidance:({
 respect_stop:'Stop teaching immediately; use the actual pause/close workflow and preserve available content.',
 advance_idea_or_topic:'Take initiative with a fresh idea or activity. Acknowledge unfinished practice when raised; do not offer to stop or repeat the same story as another grammar drill.',
 give_brief_foothold:'Explain one concrete idea, then invite a supported reaction or example. Offer Chinese if expression is blocking meaning.',
 allow_continuation:'The supplied text may be unfinished. Allow the learner to finish; do not grade a fragment or demand a full restart. Text alone does not establish an audio interruption.',
 explore_game_interest:'Explore the actual game, a choice, challenge or experience. Contribute a useful idea and ask one content question; do not turn the answer into an echo drill.',
 ask_content_followup:'Accept the communicated meaning and move to a content question or new activity. Do not request another whole-sentence repetition.',
 develop_meaning:'Contribute useful context and ask one natural follow-up when helpful.'
 })[move],scope:'Advisory steering for delegated turns, not control of native Voice.'};
}
