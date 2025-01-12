// Базовые настройки улучшений
const baseUpgrades = [
    { 
        id: 1, 
        name: "Улучшение клика", 
        baseCost: 10,
        basePower: 1,
        type: "click",
        getProfit: (level, power) => power * level
    },
    { 
        id: 2, 
        name: "Автоматический сборщик", 
        baseCost: 50,
        basePower: 1,
        type: "auto",
        getProfit: (level, power) => power * level
    },
    { 
        id: 3, 
        name: "Супер клик", 
        baseCost: 100,
        basePower: 5,
        type: "click",
        getProfit: (level, power) => power * level
    },
    { 
        id: 4, 
        name: "Увеличение энергии", 
        baseCost: 75,
        basePower: 25,
        type: "energy",
        getProfit: (level, power) => power * level
    }
];

// Класс магазина
class Shop {
    constructor(game) {
        this.game = game;
        this.upgrades = this.initializeUpgrades();
        this.modal = document.getElementById('shopModal');
        this.upgradesList = document.getElementById('upgradesList');
        this.setupEventListeners();
    }

    initializeUpgrades() {
        return baseUpgrades.map(upgrade => ({
            ...upgrade,
            level: 0
        }));
    }

    setupEventListeners() {
        // Обработчик открытия магазина
        document.getElementById('shopButton').addEventListener('click', () => {
            this.openShop();
            // Активируем кнопку магазина в навигации
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById('shopButton').classList.add('active');
        });

        // Обработчик закрытия магазина по клику вне модального окна
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeShop();
                // Возвращаемся на главную
                document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
                document.getElementById('homeButton').classList.add('active');
            }
        });

        // Обработчик кнопки "Главная"
        document.getElementById('homeButton').addEventListener('click', () => {
            this.closeShop();
        });
    }

    openShop() {
        this.modal.style.display = 'block';
        this.renderUpgrades();
    }

    closeShop() {
        this.modal.style.display = 'none';
    }

    renderUpgrades() {
        this.upgradesList.innerHTML = '';
        this.upgrades.forEach(upgrade => {
            const cost = Math.floor(upgrade.baseCost * Math.pow(gameConfig.costMultiplier, upgrade.level));
            const power = upgrade.basePower * Math.pow(gameConfig.powerMultiplier, upgrade.level);
            const profit = Math.floor(upgrade.getProfit(upgrade.level + 1, power));
            
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.innerHTML = `
                <h3>${upgrade.name}</h3>
                <div class="upgrade-info">
                    <div class="upgrade-stats">
                        <span class="level">Уровень: ${upgrade.level}</span>
                        <span class="profit">Прибыль: +${profit} ${this.getProfitType(upgrade.type)}</span>
                        <span>Стоимость: ${cost} очков</span>
                    </div>
                </div>
                <button onclick="window.shop.buyUpgrade(${upgrade.id})" 
                        ${this.game.score < cost ? 'disabled' : ''}>
                    ${upgrade.level === 0 ? 'КУПИТЬ' : 'УЛУЧШИТЬ'}
                </button>
            `;
            this.upgradesList.appendChild(upgradeElement);
        });
    }

    getProfitType(type) {
        switch(type) {
            case 'click': return 'за клик';
            case 'auto': return 'в секунду';
            case 'energy': return 'энергии';
            default: return '';
        }
    }

    buyUpgrade(id) {
        const upgrade = this.upgrades.find(u => u.id === id);
        if (!upgrade) return;

        const cost = Math.floor(upgrade.baseCost * Math.pow(gameConfig.costMultiplier, upgrade.level));
        if (this.game.score < cost) return;

        this.game.score -= cost;
        upgrade.level++;

        // Применяем эффекты улучшения
        const power = Math.floor(upgrade.basePower * Math.pow(gameConfig.powerMultiplier, upgrade.level));
        switch(upgrade.type) {
            case 'click':
                this.game.clickPower = Math.floor(power);
                break;
            case 'auto':
                this.game.autoClickPower = Math.floor(power);
                break;
            case 'energy':
                this.game.maxEnergy = Math.floor(power);
                break;
        }

        this.game.updateUI();
        this.renderUpgrades();
    }
}

// Ждем инициализации игры и создаем магазин
window.addEventListener('load', () => {
    window.shop = new Shop(window.game);
});
