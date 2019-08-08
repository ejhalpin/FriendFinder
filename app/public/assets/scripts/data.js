var phrases = [
  "Leave a Friend, Take a Friend.",
  "Friend Finder = Significant Nods.",
  "We've Got a BS in BFFs.",
  "You CAN Pick Your Firend's Nose!",
  "Because Co-dependency.",
  "Glutton for Friendship.",
  "Good People, Better Hugs.",
  "Fast Friends or Your Money Back.",
  "Friend Finder = Handshakes.",
  "You can feel the web in our handshakes.",
  "The best friendships are found through quizzes.",
  "Watch out Cupid. We're coming for you.",
  "This isn't NAM. There are rules."
];

async function swapphrases() {
  setInterval(() => {
    $("#phrase").text(phrases[Math.floor(Math.random() * phrases.length)]);
  }, 8000);
}

$(document).ready(function() {
  $("#phrase").text(phrases[Math.floor(Math.random() * phrases.length)]);
  swapphrases();
});
