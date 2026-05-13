export function getAvatarUrl(person) {
  if (!person) return 'https://i.pravatar.cc/150?img=1';

  if (person.avatar_url) {
    const match = String(person.avatar_url).match(/img=(\d+)/i);
    if (match) {
      return `https://i.pravatar.cc/150?img=${match[1]}`;
    }

    return person.avatar_url;
  }

  const numericId = Number(person.id ?? person.user_id);
  const avatarId = Number.isFinite(numericId) && numericId > 0 ? ((numericId - 1) % 70) + 1 : 1;
  return `https://i.pravatar.cc/150?img=${avatarId}`;
}