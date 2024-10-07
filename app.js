const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Adjust canvas size for mobile responsiveness
canvas.width = 1280; // Fixed width for 16:9 ratio
canvas.height = 720; // Fixed height for 16:9 ratio

const playerImg = new Image();
playerImg.src = 'images/player.png'; // Default player image

const playerFallImg = new Image();
playerFallImg.src = 'images/player2.png'; // Player image after collision (before falling)

const enemyImg = new Image();
enemyImg.src = 'images/enemy.png';

const collectibleImg = new Image(); // New image for collectibles
collectibleImg.src = 'images/collectible.png'; // Add the path to your collectible image

const backgroundImg = new Image(); // New image for the background
backgroundImg.src = 'images/background.png'; // Path to your background image

// Background music
const backgroundMusic = new Audio('images/background-music.mp3'); // Path to your music file
backgroundMusic.loop = true; // Loop the music

// Death audio
const deathAudio = new Audio('images/death.mp3'); // Path to your death audio file

let player = { x: 50, y: 50, width: 100, height: 100, speed: 8 }; // Increased speed
let enemy = { x: 200, y: 200, width: 50, height: 50, speed: 2 };
let collectibles = [];
let score = 0;
let gameStarted = false;
let isGameOver = false; // To prevent multiple game over triggers
let fallSpeed = 10; // Fixed fall speed for the player
let startTime = null; // Track start time for linear speed increase

// Direction tracking for D-Pad buttons
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

// Function to spawn a new collectible at a random position
function spawnCollectible() {
    const collectible = { x: Math.random() * (canvas.width - 50), y: Math.random() * (canvas.height - 50), size: 70 }; // Adjust size
    collectibles.push(collectible);
}

function startGame() {
    score = 0;
    collectibles = [];
    gameStarted = true;
    isGameOver = false; // Reset game over state
    fallSpeed = 10; // Reset fall speed to a fixed value
    player.x = 50;
    player.y = 50;
    playerImg.src = 'images/player.png'; // Reset to the original player image
    enemy.x = Math.random() * (canvas.width - enemy.width);
    enemy.y = Math.random() * (canvas.height - enemy.height);
    document.getElementById('score').innerText = score;
    
    // Spawn the first collectible
    spawnCollectible();
    
    // Play background music
    backgroundMusic.play(); // Start playing music

    startTime = Date.now(); // Set the start time of the game

    gameLoop(); // Start the game loop
}

function gameLoop() {
    const elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds
    enemy.speed = 2 + elapsedTime * 0.1; // Increase enemy speed linearly by 0.1 units per second

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height); // Ensure this is drawn first

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    
    // Draw enemy
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Move enemy towards player
    if (enemy.x < player.x) enemy.x += enemy.speed;
    if (enemy.x > player.x) enemy.x -= enemy.speed;
    if (enemy.y < player.y) enemy.y += enemy.speed;
    if (enemy.y > player.y) enemy.y -= enemy.speed;

    // Check for collision
    if (checkCollision(player, enemy)) {
        gameOver();
        return; // Stop the game loop immediately
    }

    // Draw collectibles
    collectibles.forEach((collectible, index) => {
        // Draw collectible as an image
        ctx.drawImage(collectibleImg, collectible.x, collectible.y, collectible.size, collectible.size);

        // Check if player collects
        if (checkCollision(player, { x: collectible.x, y: collectible.y, width: collectible.size, height: collectible.size })) {
            collectibles.splice(index, 1); // Remove collectible
            score++;
            document.getElementById('score').innerText = score;

            // Spawn a new collectible after collecting
            spawnCollectible();
        }
    });

    // Update player position based on D-Pad
    if (upPressed && player.y > 0) player.y -= player.speed; // Move up
    if (downPressed && player.y < canvas.height - player.height) player.y += player.speed; // Move down
    if (leftPressed && player.x > 0) player.x -= player.speed; // Move left
    if (rightPressed && player.x < canvas.width - player.width) player.x += player.speed; // Move right

    requestAnimationFrame(gameLoop); // Continue the game loop
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function gameOver() {
    if (isGameOver) return; // Prevent multiple triggers
    isGameOver = true;

    // Stop the background music
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset to the start

    // Play death audio
    deathAudio.currentTime = 0; // Reset to the start
    deathAudio.play(); // Play the death sound

    // Change player's image to 'player2.png'
    playerImg.src = 'images/player2.png'; // Change player image to the fallen state

    // Draw the new player image on the canvas
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Wait for 1 second before starting the fall animation
    setTimeout(() => {
        requestAnimationFrame(fallAnimation); // Start the fall animation after delay
    }, 1000); // 1 second pause before falling animation starts
}

// Falling animation for player with a fixed speed
function fallAnimation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the background and other elements
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Apply the fixed fall speed
    player.y += fallSpeed; // Player falls at a fixed speed

    // Draw the falling player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Continue the animation until the player falls off the screen
    if (player.y < canvas.height) {
        requestAnimationFrame(fallAnimation); // Continue the fall
    } else {
        // Once the player has fallen off the screen, trigger the final game over screen
        setTimeout(showGameOverScreen, 500); // A slight delay before showing the final game over
    }
}

// Function to display the final Game Over alert
function showGameOverScreen() {
    // Game over alert
    const alertMessage = `Game Over! Your score: ${score}`;
    const alertBox = document.createElement('div');
    alertBox.innerText = alertMessage;
    alertBox.style.position = 'absolute';
    alertBox.style.top = '50%';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translate(-50%, -50%)';
    alertBox.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    alertBox.style.padding = '20px';
    alertBox.style.border = '2px solid #333';
    alertBox.style.zIndex = '10';
    document.body.appendChild(alertBox);

    setTimeout(() => {
        document.body.removeChild(alertBox); // Remove the alert after 1 second
        isGameOver = false; // Reset the game state
    }, 1000);
}

document.getElementById('startButton').addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    }
});

// D-pad button event listeners for mobile controls
document.getElementById('upButton').addEventListener('touchstart', function() {
    upPressed = true; // Set upPressed to true
});
document.getElementById('upButton').addEventListener('touchend', function() {
    upPressed = false; // Set upPressed to false
});

document.getElementById('downButton').addEventListener('touchstart', function() {
    downPressed = true; // Set downPressed to true
});
document.getElementById('downButton').addEventListener('touchend', function() {
    downPressed = false; // Set downPressed to false
});

document.getElementById('leftButton').addEventListener('touchstart', function() {
    leftPressed = true; // Set leftPressed to true
});
document.getElementById('leftButton').addEventListener('touchend', function() {
    leftPressed = false; // Set leftPressed to false
});

document.getElementById('rightButton').addEventListener('touchstart', function() {
    rightPressed = true; // Set rightPressed to true
});
document.getElementById('rightButton').addEventListener('touchend', function() {
    rightPressed = false; // Set rightPressed to false
});

// Remove keyboard controls since they're not needed
