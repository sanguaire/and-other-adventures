import gsap from "/scripts/greensock/esm/all.js";

export const addDiceIconAnimation = html => {
    html.find("i.fa-dice-d20").each((i, e) => {
        const ease = "none";
        const duration = 0.5;
        const animation = gsap.to(e, {paused: true, scale: 1.2, rotation: "random(-45, 45, 5)", ease, duration});

        e.addEventListener("mouseenter", () => {
            animation.duration(duration);
            animation.ease = ease;
            animation.play();
        });
        e.addEventListener("mouseleave", () => {
            animation.duration(0.5);
            animation.ease = "none";
            animation.reverse();
        });
    });
};
