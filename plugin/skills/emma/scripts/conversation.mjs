export function nextMove({learner_text='',previous_move=null}={}){
 const text=learner_text.trim();let move='develop_meaning';
 if(/^(?:ok(?:ay)?[,. ]*)?(?:(?:let'?s|can we|i want to)\s+)?(?:stop(?: here| now| the (?:lesson|test(?:ing)?))?|pause(?: here| now)?|finish(?: for today)?)[.!? ]*$|\bi (?:need|have) to (?:go|leave)\b|\bi.?m done for today\b/iu.test(text))move='respect_stop';
 else if(/\b(?:what else|anything else|another topic|talk about something else|change (?:the )?topic|move on)\b|还有什么|聊别的/iu.test(text))move='advance_idea_or_topic';
 else if(/\b(?:no idea|don.t know|not sure|don.t understand)\b|不懂|不知道/iu.test(text))move='give_brief_foothold';
 else if(/\b(?:video games?|playing games?|played a game|gaming)\b/iu.test(text))move='explore_game_interest';
 else if(previous_move==='recast'||previous_move==='model')move='ask_content_followup';
 return{move,force_echo:false,force_one_sentence:false,praise_basis:'specific demonstrated meaning only; never label an unresolved form perfect',guidance:({respect_stop:'Stop teaching immediately; use the actual pause/close workflow and preserve available content.',advance_idea_or_topic:'Offer a fresh angle, useful context or manageable reading; do not repeat the same story as another grammar drill.',give_brief_foothold:'Explain one concrete idea, then invite a supported reaction or example.',explore_game_interest:'Ask about the actual game, a choice, challenge or experience; do not turn the answer into an echo drill.',ask_content_followup:'Continue the learner’s meaning after the recast rather than asking for imitation.',develop_meaning:'Contribute useful context and ask one natural follow-up when helpful.'})[move],scope:'Advisory steering for delegated turns, not control of native Voice.'};
}
