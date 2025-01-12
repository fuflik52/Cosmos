class Game {
    constructor() {
        this.score = 0;
        this.energy = 100;
        this.maxEnergy = 1000;
        this.clickPower = 1;
        this.autoClickPower = 0;
        
        this.lastTick = Date.now();
        
        this.setupEventListeners();
        this.loadGame();
        this.startGameLoop();
        
        // Устанавливаем активную вкладку при старте
        document.getElementById('homeButton').classList.add('active');
    }

    setupEventListeners() {
        // Обработчик клика
        document.getElementById('clickButton').addEventListener('click', () => this.click());
        
        // Обработчики навигации
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    click() {
        if (this.energy <= 0) return;
        
        this.score = Math.floor(this.score + this.clickPower);
        this.energy = Math.max(0, this.energy - 5);
        this.updateUI();
        
        // Анимация клика
        const button = document.getElementById('clickButton');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    autoClick() {
        if (this.autoClickPower > 0) {
            this.score = Math.floor(this.score + this.autoClickPower);
            this.updateUI();
        }
    }

    regenerateEnergy() {
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 1);
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = Math.floor(this.score).toLocaleString();
        
        const energyFill = document.getElementById('energyFill');
        const energyPercent = (this.energy / this.maxEnergy) * 100;
        energyFill.style.width = energyPercent + '%';
        
        this.saveGame();
    }

    startGameLoop() {
        setInterval(() => {
            const now = Date.now();
            const delta = (now - this.lastTick) / 1000;
            
            this.autoClick();
            this.regenerateEnergy();
            
            this.lastTick = now;
        }, 1000);
    }

    async saveGame() {
        const gameState = {
            score: this.score,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            clickPower: this.clickPower,
            autoClickPower: this.autoClickPower
        };
        
        // Сохраняем локально
        localStorage.setItem('gameState', JSON.stringify(gameState));
        
        // Сохраняем на сервере
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            try {
                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: window.Telegram.WebApp.initDataUnsafe.user.id,
                        gameState
                    })
                });
                const data = await response.json();
                if (!data.success) {
                    console.error('Failed to save game state to server');
                }
            } catch (err) {
                console.error('Error saving game state:', err);
            }
        }
    }

    async loadGame() {
        let gameState = null;
        
        // Пытаемся загрузить с сервера
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            try {
                const response = await fetch(`/api/load/${window.Telegram.WebApp.initDataUnsafe.user.id}`);
                gameState = await response.json();
            } catch (err) {
                console.error('Error loading game state from server:', err);
            }
        }
        
        // Если не удалось загрузить с сервера, используем локальное сохранение
        if (!gameState) {
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                gameState = JSON.parse(savedState);
            }
        }

        // Применяем состояние
        if (gameState) {
            this.score = gameState.score;
            this.energy = gameState.energy;
            this.maxEnergy = gameState.maxEnergy;
            this.clickPower = gameState.clickPower;
            this.autoClickPower = gameState.autoClickPower;
            this.updateUI();
        }
    }
}

// Инициализация игры
window.game = new Game();
