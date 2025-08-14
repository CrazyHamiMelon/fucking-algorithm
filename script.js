/**
 * 贺卡订制编辑器类
 * 基于Fabric.js实现的贺卡定制系统
 */
class GreetingCardEditor {
    constructor() {
        // 初始化属性
        this.canvas = null;                    // Fabric.js画布实例
        this.backgroundImage = null;           // 背景图片对象
        this.uploadedImages = [];              // 上传的装饰图片数组
        this.textBoxes = [];                   // 文本框数组
        this.currentTextObject = null;         // 当前编辑的文本对象
        this.isEditing = false;                // 编辑状态标志
        
        // 设置限制数量
        this.maxImages = 5;                    // 最大图片数量
        this.maxTexts = 3;                     // 最大文本框数量
        
        // 初始化系统
        this.init();
    }
    
    /**
     * 初始化系统
     */
    init() {
        this.initCanvas();                     // 初始化画布
        this.bindEvents();                     // 绑定事件
        this.setupTextEditor();                // 设置文字编辑器
    }
    
    /**
     * 初始化Fabric.js画布
     */
    initCanvas() {
        this.canvas = new fabric.Canvas('greetingCard', {
            width: 800,                        // 画布宽度
            height: 600,                       // 画布高度
            backgroundColor: '#ffffff'          // 画布背景色
        });
        
        // 设置画布选择模式
        this.canvas.selection = false;         // 禁用多选
        this.canvas.defaultCursor = 'default'; // 设置默认光标
    }
    
    /**
     * 绑定所有事件监听器
     */
    bindEvents() {
        // 开始定制按钮事件
        document.getElementById('startCustomize').addEventListener('click', () => {
            this.startCustomization();
        });
        
        // 上传底图按钮事件
        document.getElementById('uploadBackground').addEventListener('click', () => {
            document.getElementById('backgroundInput').click();
        });
        
        // 上传图片素材按钮事件
        document.getElementById('uploadImage').addEventListener('click', () => {
            if (this.uploadedImages.length >= this.maxImages) {
                alert(`最多只能上传${this.maxImages}张图片素材`);
                return;
            }
            document.getElementById('imageInput').click();
        });
        
        // 添加文字按钮事件
        document.getElementById('addText').addEventListener('click', () => {
            if (this.textBoxes.length >= this.maxTexts) {
                alert(`最多只能添加${this.maxTexts}个文本框`);
                return;
            }
            this.addNewText();
        });
        
        // 图片素材上传处理事件
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
            e.target.value = ''; // 清空input，允许重复选择同一文件
        });
        
        // 背景图片上传处理事件
        document.getElementById('backgroundInput').addEventListener('change', (e) => {
            this.handleBackgroundUpload(e.target.files[0]);
            e.target.value = ''; // 清空input，允许重复选择同一文件
        });
        
        // 文字编辑器关闭按钮事件
        document.getElementById('closeEditor').addEventListener('click', () => {
            this.closeTextEditor();
        });
        
        // 文字编辑器应用按钮事件
        document.getElementById('applyText').addEventListener('click', () => {
            this.applyTextChanges();
        });
        
        // 文字编辑器取消按钮事件
        document.getElementById('cancelText').addEventListener('click', () => {
            this.closeTextEditor();
        });
        
        // 文字格式按钮事件
        document.getElementById('bold').addEventListener('click', () => {
            this.toggleFormat('bold');
        });
        
        document.getElementById('italic').addEventListener('click', () => {
            this.toggleFormat('italic');
        });
        
        document.getElementById('underline').addEventListener('click', () => {
            this.toggleFormat('underline');
        });
        
        // 字体控制事件
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.changeFontFamily(e.target.value);
        });
        
        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.changeFontSize(e.target.value);
        });
        
        document.getElementById('fontColor').addEventListener('change', (e) => {
            this.changeFontColor(e.target.value);
        });
        
        // 画布事件监听
        this.canvas.on('mouse:down', (e) => {
            if (e.target && e.target.type === 'textbox') {
                this.handleTextSelection(e.target);
            }
        });
        
        this.canvas.on('selection:created', (e) => {
            this.handleSelection(e);
        });
        
        this.canvas.on('selection:cleared', () => {
            this.clearSelection();
        });
    }
    
    /**
     * 开始定制贺卡
     */
    startCustomization() {
        document.getElementById('startCustomize').style.display = 'none';
        document.getElementById('uploadControls').style.display = 'block';
    }
    
    /**
     * 处理背景图片上传
     * @param {File} file - 上传的图片文件
     */
    handleBackgroundUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
                // 调整图片大小以适应画布
                const scale = Math.min(
                    this.canvas.width / img.width,
                    this.canvas.height / img.height
                );
                
                img.scale(scale);
                img.left = (this.canvas.width - img.width * scale) / 2;
                img.top = (this.canvas.height - img.height * scale) / 2;
                
                // 设置为背景，不可编辑
                img.selectable = false;         // 不可选中
                img.evented = false;           // 不可交互
                img.locked = true;             // 锁定状态
                
                this.backgroundImage = img;
                this.canvas.add(img);
                this.canvas.sendToBack(img);   // 发送到最底层
                this.canvas.renderAll();
            });
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 处理图片素材上传
     * @param {File} file - 上传的图片文件
     */
    handleImageUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
                // 限制图片大小
                const maxSize = 200;
                const scale = Math.min(maxSize / img.width, maxSize / img.height);
                
                img.scale(scale);
                img.left = 100 + this.uploadedImages.length * 50;
                img.top = 100 + this.uploadedImages.length * 50;
                
                // 设置图片可以拖拽移动
                img.selectable = true;
                img.evented = true;
                
                // 添加控制按钮
                this.addImageControls(img);
                
                this.uploadedImages.push(img);
                this.canvas.add(img);
                this.canvas.renderAll();
            });
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 为图片添加控制按钮
     * @param {fabric.Image} img - 图片对象
     */
    addImageControls(img) {
        // 创建控制按钮容器
        const controls = document.createElement('div');
        controls.className = 'image-controls';
        controls.style.position = 'absolute';
        controls.style.pointerEvents = 'none';
        controls.style.zIndex = '1000';
        
        // 创建旋转按钮
        const rotateBtn = this.createControlButton('↻', 'rotate', () => {
            img.rotate((img.angle || 0) + 15);
            this.canvas.renderAll();
            // 更新控制按钮位置
            this.updateControlPosition(controls, img);
        });
        
        // 创建缩放按钮（等比缩放）
        const scaleBtn = this.createControlButton('⤢', 'scale', () => {
            const scaleFactor = 1.1;
            img.scaleX = img.scaleX * scaleFactor;
            img.scaleY = img.scaleY * scaleFactor;
            this.canvas.renderAll();
            // 更新控制按钮位置
            this.updateControlPosition(controls, img);
        });
        
        // 创建删除按钮
        const deleteBtn = this.createControlButton('×', 'delete', () => {
            this.canvas.remove(img);
            const index = this.uploadedImages.indexOf(img);
            if (index > -1) {
                this.uploadedImages.splice(index, 1);
            }
            // 移除控制按钮
            if (controls.parentNode) {
                controls.parentNode.removeChild(controls);
            }
            this.canvas.renderAll();
        });
        
        // 将按钮添加到容器
        controls.appendChild(rotateBtn);
        controls.appendChild(scaleBtn);
        controls.appendChild(deleteBtn);
        
        // 将控制按钮添加到画布容器
        const canvasContainer = document.querySelector('.canvas-container');
        canvasContainer.appendChild(controls);
        
        // 更新控制按钮位置
        this.updateControlPosition(controls, img);
        
        // 监听图片移动事件
        img.on('moving', () => {
            this.updateControlPosition(controls, img);
        });
        
        img.on('scaling', () => {
            this.updateControlPosition(controls, img);
        });
        
        img.on('rotating', () => {
            this.updateControlPosition(controls, img);
        });
        
        // 当图片被移除时，也移除控制按钮
        img.on('removed', () => {
            if (controls.parentNode) {
                controls.parentNode.removeChild(controls);
            }
        });
    }
    
    /**
     * 创建控制按钮
     * @param {string} text - 按钮文字
     * @param {string} className - CSS类名
     * @param {Function} onClick - 点击事件处理函数
     * @returns {HTMLButtonElement} 创建的按钮元素
     */
    createControlButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.className = `control-btn ${className}`;
        btn.textContent = text;
        btn.style.pointerEvents = 'auto';
        btn.addEventListener('click', onClick);
        return btn;
    }
    
    /**
     * 更新控制按钮位置
     * 修复后的方法：按钮真正绑定到图片的四个角
     * @param {HTMLElement} controls - 控制按钮容器
     * @param {fabric.Image} img - 图片对象
     */
    updateControlPosition(controls, img) {
        const canvasRect = this.canvas.getElement().getBoundingClientRect();
        const zoom = this.canvas.getZoom();
        
        // 计算图片在屏幕上的实际位置和尺寸
        const imgLeft = img.left * zoom + canvasRect.left;
        const imgTop = img.top * zoom + canvasRect.top;
        const imgWidth = img.width * img.scaleX * zoom;
        const imgHeight = img.height * img.scaleY * zoom;
        
        // 设置控制按钮容器的位置和尺寸
        controls.style.left = `${imgLeft}px`;
        controls.style.top = `${imgTop}px`;
        controls.style.width = `${imgWidth}px`;
        controls.style.height = `${imgHeight}px`;
        
        // 获取图片的旋转角度
        const angle = img.angle || 0;
        
        // 为每个按钮设置正确的位置，考虑旋转角度
        const buttons = controls.querySelectorAll('.control-btn');
        buttons.forEach((btn, index) => {
            let btnLeft, btnTop;
            
            switch(index) {
                case 0: // 旋转按钮 - 左上角
                    btnLeft = -15;
                    btnTop = -15;
                    break;
                case 1: // 缩放按钮 - 右上角
                    btnLeft = imgWidth - 15;
                    btnTop = -15;
                    break;
                case 2: // 删除按钮 - 右下角
                    btnLeft = imgWidth - 15;
                    btnTop = imgHeight - 15;
                    break;
            }
            
            // 应用旋转变换，让按钮跟随图片旋转
            btn.style.transform = `rotate(${angle}deg)`;
            btn.style.left = `${btnLeft}px`;
            btn.style.top = `${btnTop}px`;
        });
    }
    
    /**
     * 添加新的文本框
     */
    addNewText() {
        const textbox = new fabric.Textbox('双击编辑文字', {
            left: 200,
            top: 200,
            width: 200,
            fontSize: 24,
            fontFamily: '微软雅黑',
            fill: '#000000',
            textAlign: 'left',
            editable: false
        });
        
        this.textBoxes.push(textbox);
        this.canvas.add(textbox);
        this.canvas.renderAll();
        
        // 双击编辑
        textbox.on('mousedblclick', () => {
            this.openTextEditor(textbox);
        });
    }
    
    /**
     * 打开文字编辑器
     * @param {fabric.Textbox} textbox - 文本框对象
     */
    openTextEditor(textbox) {
        this.currentTextObject = textbox;
        this.isEditing = true;
        
        // 显示编辑器
        document.getElementById('textEditor').style.display = 'block';
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        // 填充编辑器内容
        this.populateTextEditor(textbox);
        
        // 点击遮罩关闭编辑器
        overlay.addEventListener('click', () => {
            this.closeTextEditor();
        });
    }
    
    /**
     * 填充文字编辑器内容
     * @param {fabric.Textbox} textbox - 文本框对象
     */
    populateTextEditor(textbox) {
        const richTextArea = document.getElementById('richTextArea');
        
        // 清空编辑器
        richTextArea.innerHTML = '';
        
        // 创建富文本内容
        const text = textbox.text;
        const span = document.createElement('span');
        span.textContent = text;
        span.style.fontFamily = textbox.fontFamily;
        span.style.fontSize = textbox.fontSize + 'px';
        span.style.color = textbox.fill;
        span.style.fontWeight = textbox.fontWeight || 'normal';
        span.style.fontStyle = textbox.fontStyle || 'normal';
        span.style.textDecoration = textbox.underline ? 'underline' : 'none';
        
        richTextArea.appendChild(span);
        
        // 设置字体控制器的值
        document.getElementById('fontFamily').value = textbox.fontFamily;
        document.getElementById('fontSize').value = textbox.fontSize;
        document.getElementById('fontColor').value = textbox.fill;
        
        // 设置格式按钮状态
        document.getElementById('bold').classList.toggle('active', textbox.fontWeight === 'bold');
        document.getElementById('italic').classList.toggle('active', textbox.fontStyle === 'italic');
        document.getElementById('underline').classList.toggle('active', textbox.underline);
    }
    
    /**
     * 关闭文字编辑器
     */
    closeTextEditor() {
        document.getElementById('textEditor').style.display = 'none';
        
        // 移除遮罩层
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.currentTextObject = null;
        this.isEditing = false;
    }
    
    /**
     * 应用文字更改
     */
    applyTextChanges() {
        if (!this.currentTextObject) return;
        
        const richTextArea = document.getElementById('richTextArea');
        const textbox = this.currentTextObject;
        
        // 获取富文本内容
        const content = richTextArea.innerHTML;
        
        // 创建临时div来解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // 提取文本和样式信息
        const textInfo = this.extractTextInfo(tempDiv);
        
        // 更新文本框
        textbox.set({
            text: textInfo.text,
            fontFamily: textInfo.fontFamily,
            fontSize: textInfo.fontSize,
            fill: textInfo.color,
            fontWeight: textInfo.fontWeight,
            fontStyle: textInfo.fontStyle,
            underline: textInfo.underline
        });
        
        this.canvas.renderAll();
        this.closeTextEditor();
    }
    
    /**
     * 从HTML元素中提取文本信息
     * @param {HTMLElement} element - HTML元素
     * @returns {Object} 文本信息对象
     */
    extractTextInfo(element) {
        const textInfo = {
            text: '',
            fontFamily: '微软雅黑',
            fontSize: 24,
            color: '#000000',
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false
        };
        
        // 递归提取文本和样式
        const extractFromNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                textInfo.text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const style = window.getComputedStyle(node);
                
                if (node.style.fontFamily) textInfo.fontFamily = node.style.fontFamily;
                if (node.style.fontSize) textInfo.fontSize = parseInt(node.style.fontSize);
                if (node.style.color) textInfo.color = node.style.color;
                if (node.style.fontWeight === 'bold') textInfo.fontWeight = 'bold';
                if (node.style.fontStyle === 'italic') textInfo.fontStyle = 'italic';
                if (node.style.textDecoration === 'underline') textInfo.underline = true;
                
                // 递归处理子节点
                for (let child of node.childNodes) {
                    extractFromNode(child);
                }
            }
        };
        
        extractFromNode(element);
        return textInfo;
    }
    
    /**
     * 切换文字格式
     * @param {string} format - 格式类型（bold/italic/underline）
     */
    toggleFormat(format) {
        const button = document.getElementById(format);
        button.classList.toggle('active');
        
        document.execCommand(format === 'bold' ? 'bold' : 
                           format === 'italic' ? 'italic' : 'underline', false, null);
    }
    
    /**
     * 更改字体族
     * @param {string} family - 字体名称
     */
    changeFontFamily(family) {
        document.execCommand('fontName', false, family);
    }
    
    /**
     * 更改字体大小
     * @param {string} size - 字体大小
     */
    changeFontSize(size) {
        document.execCommand('fontSize', false, size);
    }
    
    /**
     * 更改字体颜色
     * @param {string} color - 字体颜色
     */
    changeFontColor(color) {
        document.execCommand('foreColor', false, color);
    }
    
    /**
     * 处理文字选择
     * @param {fabric.Textbox} textObject - 文本对象
     */
    handleTextSelection(textObject) {
        // 处理文字选择
        this.canvas.setActiveObject(textObject);
    }
    
    /**
     * 处理选择事件
     * @param {Object} e - 选择事件对象
     */
    handleSelection(e) {
        // 处理选择事件
        if (e.selected && e.selected.length > 0) {
            const obj = e.selected[0];
            if (obj.type === 'textbox') {
                // 显示文字编辑提示
                console.log('选中了文本框:', obj.text);
            }
        }
    }
    
    /**
     * 清除选择
     */
    clearSelection() {
        // 清除选择
        console.log('清除选择');
    }
    
    /**
     * 设置文字编辑器
     */
    setupTextEditor() {
        // 设置富文本编辑器的基本功能
        const richTextArea = document.getElementById('richTextArea');
        
        richTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.execCommand('insertLineBreak', false, null);
            }
        });
        
        richTextArea.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
        
        // 添加键盘快捷键支持
        richTextArea.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.toggleFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.toggleFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.toggleFormat('underline');
                        break;
                }
            }
        });
        
        // 监听选择变化，更新格式按钮状态
        richTextArea.addEventListener('mouseup', () => {
            this.updateFormatButtons();
        });
        
        richTextArea.addEventListener('keyup', () => {
            this.updateFormatButtons();
        });
    }
    
    /**
     * 更新格式按钮状态
     */
    updateFormatButtons() {
        const richTextArea = document.getElementById('richTextArea');
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            
            // 检查父元素的样式
            let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
            
            // 更新按钮状态
            document.getElementById('bold').classList.toggle('active', 
                document.queryCommandState('bold'));
            document.getElementById('italic').classList.toggle('active', 
                document.queryCommandState('italic'));
            document.getElementById('underline').classList.toggle('active', 
                document.queryCommandState('underline'));
        }
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    new GreetingCardEditor();
});