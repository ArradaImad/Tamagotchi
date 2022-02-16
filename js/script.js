var config = {
    type: Phaser.CANVAS,
    parent: 'main',
    width: 282,
    height: 220,
    canvas: document.getElementById('gameWindow'),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var text;
var tamago;
var tamagosFeelings = [];

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('gem', 'assets/gem.png');
    this.load.spritesheet('brawler', 'assets/all.png', { frameWidth: 32, frameHeight: 32 });
}

function create ()
{
    this.add.image(400, 300, 'sky');
    const gem = this.add.image(75, 80, 'gem');
    const text = this.add.text(100, 50, '', { font: '16px Courier', fill: '#00ff00' });
    gem.setData({name: 'Tamago', energy: 10, hunger: 10, joy: 10});
    text.setText([
        'Name : ' + gem.getData('name'),
        'Energy : ' + gem.getData('energy'),
        'Hunger : ' + gem.getData('hunger'),
        'Joy : ' + gem.getData('joy'),
    ]);

    tamago = this.add.sprite(141, 180, 'brawler').setScale(1.75);

    this.anims.create({
        key: 'hungry',
        frames: this.anims.generateFrameNumbers('brawler', { start: 294, end: 295 }),
        frameRate: 5
    });

    this.anims.create({
        key: 'depressed',
        frames: this.anims.generateFrameNumbers('brawler', { start: 330, end: 332 }),
        frameRate: 5
    });

    this.anims.create({
        key: 'tired',
        frames: this.anims.generateFrameNumbers('brawler', { start: 302, end: 304 }),
        frameRate: 5
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('brawler', { frames: [ 288, 289, 299, 300 ] }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'dead',
        frames: this.anims.generateFrameNumbers('brawler', { start: 1, end: 10 }),
        frameRate: 5
    });

    tamago.play('idle');


    gem.on('changedata', function (gameObject, key, value) {
        text.setText([
            'Name : ' + gem.getData('name'),
            'Energy : ' + gem.getData('energy'),
            'Hunger : ' + gem.getData('hunger'),
            'Joy : ' + gem.getData('joy'),
        ]);

        checkTamagoLife(gem.data.values, text);

        var onAnimationcomplete = function() {

            var next = tamagosFeelings.shift();

            if (next == "dead") {
                this.play("dead");
            } 
            else {
                tamagosFeelings.push(next);
                if (next) {
                    //console.log("Le suivant onAnimationcomplete : " + next);
                    this.play(next);
                }            
                else {
                    this.off("animationcomplete", onAnimationcomplete);
                }
            }
        };

        if (tamagosFeelings.length > 0) {
            let next = tamagosFeelings.shift();
            tamagosFeelings.push(next);
            console.log("Le suivant : " + next);
            tamago.play(next).on("animationcomplete", onAnimationcomplete);
        } else {
            tamago.play('idle');
        }

    });

    var feedButton = document.getElementById("feedButton");
    feedButton.onclick = function() {
        gem.data.values.hunger++;
        gem.data.values.joy--;
        gem.data.values.energy += 2;

        console.table(tamagosFeelings);
    };

    var playButton = document.getElementById("playButton");
    playButton.onclick = function() {
        gem.data.values.hunger--;
        gem.data.values.joy++;
        gem.data.values.energy--;
        console.table(tamagosFeelings);

        checkTamagoLife(gem.data.values, text);
    };
}

function update ()
{
    // cursors = this.input.keyboard.createCursorKeys();

    // if (cursors.left.isDown)
    // {
    //     tamago.setVelocityX(-160);

    //     tamago.anims.play('left', true);
    // }
    // else if (cursors.right.isDown)
    // {
    //     tamago.setVelocityX(160);

    //     tamago.anims.play('right', true);
    // }
    // else
    // {
    //     tamago.setVelocityX(0);

    //     tamago.play('idle');
    // }

    // if (cursors.up.isDown && tamago.body.touching.down)
    // {
    //     tamago.setVelocityY(-330);
    // }
}

function checkTamagoLife(tamago) {
    if (tamago.hunger <= 0 || tamago.energy <= 0 || tamago.joy <= 0) {
        tamagosFeelings = [];
        tamagosFeelings.push("dead");

        // ressuciter le tammagocchi --> viré statut dead
    }
    else if (tamago.hunger <= 5 && !tamagosFeelings.includes('hungry')) {
        tamagosFeelings.push('hungry');
    }
    else if (tamago.joy <= 5 && !tamagosFeelings.includes('depressed')) {
        tamagosFeelings.push('depressed');
    }
    else if (tamago.energy <= 5 && !tamagosFeelings.includes('tired')) {
        tamagosFeelings.push('tired');
    }

    if (tamago.hunger >= 5 && tamagosFeelings.includes('hungry')) {
        tamagosFeelings = tamagosFeelings.filter((e) => { e !== 'hungry'});
    }

    if (tamago.energy >= 5 && tamagosFeelings.includes('tired')) {
        tamagosFeelings = tamagosFeelings.filter((e) => { e !== 'tired'});
    }

    if (tamago.joy >= 5 && tamagosFeelings.includes('depressed')) {
        tamagosFeelings = tamagosFeelings.filter((e) => { e !== 'depressed'});
    }
}