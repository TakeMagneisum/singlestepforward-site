(function (global) {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function containsPhrase(text, phrase) {
    return (" " + text + " ").includes(" " + phrase + " ");
  }

  function hasAny(text, phrases) {
    return phrases.some((phrase) => containsPhrase(text, phrase));
  }

  function urgentIntent(query) {
    const q = normalize(query);
    const words = new Set(q.split(" "));

    const emergency = hasAny(q, [
      "cant breathe", "cannot breathe", "not breathing", "chest pain", "unconscious",
      "overdose", "overdosing", "took too many pills", "taken too many pills",
      "swallowed too many pills", "bleeding badly", "severe bleeding", "shots fired",
      "gun pointed", "gun is pointed", "pointing a gun", "has a gun and", "armed person", "active shooter",
      "house is on fire", "building is on fire", "home is on fire", "fire in my home",
      "there is a fire", "stabbed", "crime in progress", "immediate danger",
      "life threatening", "being attacked", "breaking in", "choking right now", "choking me right now"
    ]);

    const suicide = hasAny(q, [
      "suicide", "suicidal", "kill myself", "killing myself", "want to die",
      "hurt myself", "hurting myself", "self harm", "end my life", "ending my life",
      "thinking about ending it", "thinking of ending it", "end it all",
      "dont want to live", "do not want to live", "cant go on", "cannot go on",
      "better off dead", "wants to die", "someone wants to die", "someone is suicidal",
      "friend wants to die", "thinking about suicide", "thinking of suicide"
    ]);

    const violence = hasAny(q, [
      "domestic violence", "partner hurting", "abuse at home", "unsafe at home",
      "being abused", "protective order", "escape my partner", "hit me", "being hit",
      "he is going to kill me", "hes going to kill me", "he will kill me",
      "she is going to kill me", "shes going to kill me", "she will kill me",
      "they are going to kill me", "threatened to kill me", "sexual assault",
      "sexually assaulted", "being raped", "was raped", "child abuse",
      "child is being abused", "abusing my child", "human trafficking",
      "being trafficked", "sex trafficking", "labor trafficking", "stalking me",
      "strangling me", "choking me", "forced me to have sex"
    ]) || (
      (words.has("partner") || words.has("husband") || words.has("wife") || words.has("boyfriend") || words.has("girlfriend")) &&
      (words.has("hurt") || words.has("hurting") || words.has("abuse") || words.has("abusing") || words.has("threatening"))
    );

    if (emergency) return "emergency";
    if (suicide) return "suicide";
    if (violence) return "violence";
    return "";
  }

  global.SSF_URGENT_INTENT = urgentIntent;
})(typeof window !== "undefined" ? window : globalThis);
