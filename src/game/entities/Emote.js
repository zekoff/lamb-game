import Phaser from 'phaser';

const EMOTE_LENGTH = 1000;

class Emote extends Phaser.GameObjects.Sprite {
    static BLANK = 0;
    static HEART = 1;
    static ANGRY = 2;
    static MUSIC = 3;
    static FOOD = 4;

    constructor(owner, emoteType = Emote.BLANK) {
        super(owner.scene, owner.x, owner.y, 'emote_bubbles');
        this.owner = owner;
        owner.scene.add.existing(this);
        this.setScale(2);
        this.setFrame(emoteType);
        this.owner.childObjects.add(this);

        owner.scene.time.delayedCall(EMOTE_LENGTH, () => {
            this.destroy();
        });

        // Update the emote position after the physics step has run for this frame
        // (Prevents emote lagging behind when lamb starts and stops moving)
        owner.scene.events.on('postupdate', (time, delta) => {
            this.setFlipX(owner.flipX);
            this.setX(owner.flipX ? owner.x - 72 : owner.x + 72);
            this.y = owner.y - 60;
            this.depth = this.owner.depth + 1;
        });

    }

    update() {
    }
}

export default Emote;