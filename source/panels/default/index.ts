/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
Editor.Panel.define =
    Editor.Panel.define ||
    function (options: any) {
        return options;
    };

import { i18n } from '../../utils/config';
import { logger } from '../../utils/logger';

module.exports = Editor.Panel.define({
    listeners: {
        show() {
            logger.info('面板显示');
        },
        hide() {
            logger.info('面板隐藏');
        },
    },
    template: `
    <div class="panel-container">
        <header>
            <h1 class="panel-title">${Editor.I18n.t(i18n('panel.default.title'))}</h1>
        </header>
        <main>
            <div class="content-area">
                <p class="panel-message">${Editor.I18n.t(i18n('panel.default.welcome'))}</p>
                <ui-button class="panel-button">${Editor.I18n.t(i18n('panel.default.click_me'))}</ui-button>
                <p class="click-count" style="margin-top: 10px;">${Editor.I18n.t(i18n('panel.default.click_count'))}: 0</p>
            </div>
        </main>
    </div>
    `,
    style: `
    .panel-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: var(--color-normal-contrast-weakest);
        background-color: var(--color-normal-fill-emphasis);
    }
    
    header {
        padding: 10px 20px;
        border-bottom: 1px solid var(--color-normal-border-emphasis);
    }
    
    .panel-title {
        color: var(--color-primary-contrast);
        font-size: 18px;
        margin: 0;
    }
    
    main {
        flex: 1;
        padding: 20px;
        overflow: auto;
    }
    
    .content-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    
    .panel-message {
        margin-bottom: 15px;
    }
    
    .panel-button {
        margin-top: 20px;
    }
    `,
    $: {
        container: '.panel-container',
        title: '.panel-title',
        message: '.panel-message',
        button: '.panel-button',
        clickCount: '.click-count',
    },
    methods: {
        onButtonClick() {
            // 获取当前计数
            const countEl = this.$.clickCount;
            if (!countEl) {
                logger.warn('计数元素不存在');
                return;
            }

            const currentText = countEl.textContent || '';
            const currentCount = parseInt(currentText.replace(/[^0-9]/g, '') || '0') + 1;

            // 更新消息和计数显示
            if (this.$.message) {
                this.$.message.textContent = Editor.I18n.t(
                    i18n('panel.default.click_message'),
                    { count: currentCount }
                );
            }

            countEl.textContent = `${Editor.I18n.t(i18n('panel.default.click_count'))}: ${currentCount}`;

            logger.info(`按钮被点击了 ${currentCount} 次`);
        },
    },
    ready() {
        // 只设置监听器
        if (this.$.button) {
            this.$.button.addEventListener('confirm', this.onButtonClick.bind(this));
        }

        logger.info('面板已准备就绪');
    },
    beforeClose() {
        // 移除事件监听器
        if (this.$.button) {
            this.$.button.removeEventListener('confirm', this.onButtonClick);
        }
        logger.info('面板即将关闭');
    },
    close() {
        logger.info('面板已关闭');
    },
});
