import { supabase } from './supabase';


export async function getOrCreateConversation(otherUserId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not signed in');
  }

  const myId = user.id;

  const { data: myConvos, error: myConvosError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', myId);

  if (myConvosError) throw myConvosError;

  const ids = (myConvos ?? []).map(row => row.conversation_id);
  if (ids.length > 0) {
    const { data: matches, error: matchesError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', ids)
      .eq('user_id', otherUserId);

    if (matchesError) throw matchesError;

    if (matches && matches.length > 0) {
      return matches[0].conversation_id as number;
    }
  }

  const { data: convo, error: convoError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (convoError) throw convoError;

  const convoId = convo.id as number;

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: convoId, user_id: myId },
      { conversation_id: convoId, user_id: otherUserId },
    ]);

  if (partError) throw partError;

  return convoId;
}
