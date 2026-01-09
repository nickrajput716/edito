// DOM Elements
const fileInput = document.getElementById('file-input');
const filterBtns = document.querySelectorAll('.section .options .btn');
const filterName = document.querySelector('.slider-info .name');
const filterValue = document.querySelector('.slider-info .value');
const filterSlider = document.querySelector('.filter-slider');
const rotateBtns = document.querySelectorAll('.rotate-options .btn');
const previewImg = document.getElementById('preview-img');
const previewArea = document.getElementById('preview-area');
const emptyState = document.querySelector('.empty-state');
const resetBtn = document.getElementById('reset-btn');
const chooseBtn = document.getElementById('choose-btn');
const saveBtn = document.getElementById('save-btn');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const maintainRatio = document.getElementById('maintain-ratio');
const fileInfo = document.getElementById('file-info');
const dimensionsText = document.getElementById('dimensions-text');
const targetSize = document.getElementById('target-size');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const sizeInfo = document.getElementById('size-info');
const fileSizeText = document.getElementById('file-size-text');

// State Variables
let brightness = 100, saturation = 100, inversion = 0, grayscale = 0;
let rotate = 0, flipHorizontal = 1, flipVertical = 1;
let originalWidth = 0, originalHeight = 0;
let resizeWidth = 0, resizeHeight = 0;
let imageQuality = 0.92;
let currentFileSize = 0;

// Load Image Function
const loadImage = () => {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.onload = () => {
            originalWidth = previewImg.naturalWidth;
            originalHeight = previewImg.naturalHeight;
            resizeWidth = originalWidth;
            resizeHeight = originalHeight;
            
            widthInput.value = originalWidth;
            heightInput.value = originalHeight;
            dimensionsText.textContent = `Original: ${originalWidth} x ${originalHeight}px`;
            fileInfo.style.display = 'flex';
            
            // Calculate initial file size
            calculateFileSize();
            
            emptyState.style.display = 'none';
            previewImg.style.display = 'block';
            document.querySelector('.container').classList.remove('disable');
            resetFilter();
        };
    };
    reader.readAsDataURL(file);
};

// Apply Filter Function
const applyFilter = () => {
    previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
};

// Filter Button Event Listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.closest('.rotate-options')) return;
        
        document.querySelector('.options .btn.active')?.classList.remove('active');
        btn.classList.add('active');
        filterName.textContent = btn.textContent.trim();
        
        if (btn.id === 'brightness') {
            filterSlider.max = 200;
            filterSlider.value = brightness;
            filterValue.textContent = `${brightness}%`;
        } else if (btn.id === 'saturation') {
            filterSlider.max = 200;
            filterSlider.value = saturation;
            filterValue.textContent = `${saturation}%`;
        } else if (btn.id === 'inversion') {
            filterSlider.max = 100;
            filterSlider.value = inversion;
            filterValue.textContent = `${inversion}%`;
        } else {
            filterSlider.max = 100;
            filterSlider.value = grayscale;
            filterValue.textContent = `${grayscale}%`;
        }
    });
});

// Filter Slider Event Listener
filterSlider.addEventListener('input', () => {
    filterValue.textContent = `${filterSlider.value}%`;
    const activeFilter = document.querySelector('.options .btn.active');
    
    if (activeFilter.id === 'brightness') {
        brightness = filterSlider.value;
    } else if (activeFilter.id === 'saturation') {
        saturation = filterSlider.value;
    } else if (activeFilter.id === 'inversion') {
        inversion = filterSlider.value;
    } else {
        grayscale = filterSlider.value;
    }
    applyFilter();
});

// Rotate Button Event Listeners
rotateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.id === 'left') {
            rotate -= 90;
        } else if (btn.id === 'right') {
            rotate += 90;
        } else if (btn.id === 'horizontal') {
            flipHorizontal = flipHorizontal === 1 ? -1 : 1;
        } else {
            flipVertical = flipVertical === 1 ? -1 : 1;
        }
        applyFilter();
    });
});

// Width Input Event Listener
widthInput.addEventListener('input', () => {
    if (maintainRatio.checked && widthInput.value) {
        const ratio = originalHeight / originalWidth;
        heightInput.value = Math.round(widthInput.value * ratio);
    }
    resizeWidth = widthInput.value || originalWidth;
    resizeHeight = heightInput.value || originalHeight;
    calculateFileSize();
});

// Height Input Event Listener
heightInput.addEventListener('input', () => {
    if (maintainRatio.checked && heightInput.value) {
        const ratio = originalWidth / originalHeight;
        widthInput.value = Math.round(heightInput.value * ratio);
    }
    resizeWidth = widthInput.value || originalWidth;
    resizeHeight = heightInput.value || originalHeight;
    calculateFileSize();
});

// Quality Slider Event Listener
qualitySlider.addEventListener('input', () => {
    imageQuality = qualitySlider.value / 100;
    qualityValue.textContent = `${qualitySlider.value}%`;
    calculateFileSize();
});

// Target Size Input Event Listener
targetSize.addEventListener('input', () => {
    if (!targetSize.value) return;
    
    const targetKB = parseInt(targetSize.value);
    adjustQualityForTargetSize(targetKB);
});

// Calculate File Size Function
const calculateFileSize = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = resizeWidth || originalWidth;
    canvas.height = resizeHeight || originalHeight;
    
    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    if (rotate !== 0) {
        ctx.rotate(rotate * Math.PI / 180);
    }
    
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', imageQuality);
    const base64Length = dataUrl.length - 'data:image/jpeg;base64,'.length;
    const sizeInBytes = (base64Length * 3) / 4;
    currentFileSize = Math.round(sizeInBytes / 1024);
    
    fileSizeText.textContent = `Current: ${currentFileSize} KB (Quality: ${Math.round(imageQuality * 100)}%)`;
    sizeInfo.style.display = 'flex';
};

// Adjust Quality for Target Size Function
const adjustQualityForTargetSize = async (targetKB) => {
    let minQuality = 1;
    let maxQuality = 100;
    let bestQuality = 92;
    let iterations = 0;
    const maxIterations = 15;
    
    while (iterations < maxIterations && maxQuality - minQuality > 1) {
        const testQuality = Math.round((minQuality + maxQuality) / 2);
        imageQuality = testQuality / 100;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = resizeWidth || originalWidth;
        canvas.height = resizeHeight || originalHeight;
        
        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        if (rotate !== 0) {
            ctx.rotate(rotate * Math.PI / 180);
        }
        
        ctx.scale(flipHorizontal, flipVertical);
        ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', imageQuality);
        const base64Length = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = (base64Length * 3) / 4;
        const sizeInKB = Math.round(sizeInBytes / 1024);
        
        if (sizeInKB > targetKB) {
            maxQuality = testQuality;
        } else {
            minQuality = testQuality;
            bestQuality = testQuality;
        }
        
        iterations++;
    }
    
    qualitySlider.value = bestQuality;
    imageQuality = bestQuality / 100;
    qualityValue.textContent = `${bestQuality}%`;
    calculateFileSize();
};

// Reset Filter Function
const resetFilter = () => {
    brightness = 100;
    saturation = 100;
    inversion = 0;
    grayscale = 0;
    rotate = 0;
    flipHorizontal = 1;
    flipVertical = 1;
    
    widthInput.value = originalWidth;
    heightInput.value = originalHeight;
    resizeWidth = originalWidth;
    resizeHeight = originalHeight;
    
    filterBtns[0].click();
    applyFilter();
};

// Save Image Function
const saveImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = resizeWidth;
    canvas.height = resizeHeight;
    
    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    if (rotate !== 0) {
        ctx.rotate(rotate * Math.PI / 180);
    }
    
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    
    // Use JPEG with quality for compression, PNG if quality is 100%
    const format = imageQuality === 1 ? 'image/png' : 'image/jpeg';
    const extension = imageQuality === 1 ? 'png' : 'jpg';
    
    const link = document.createElement('a');
    link.download = `edito-image-${Date.now()}.${extension}`;
    link.href = canvas.toDataURL(format, imageQuality);
    link.click();
    
    // Show final file size
    const dataUrl = canvas.toDataURL(format, imageQuality);
    const base64Length = dataUrl.length - `data:${format};base64,`.length;
    const sizeInBytes = (base64Length * 3) / 4;
    const finalSize = Math.round(sizeInBytes / 1024);
    
    setTimeout(() => {
        alert(`Image downloaded successfully!\nFinal file size: ${finalSize} KB`);
    }, 100);
};

// Drag and Drop Event Listeners
previewArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    previewArea.classList.add('drag-over');
});

previewArea.addEventListener('dragleave', () => {
    previewArea.classList.remove('drag-over');
});

previewArea.addEventListener('drop', (e) => {
    e.preventDefault();
    previewArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        loadImage();
    }
});

// Button Event Listeners
resetBtn.addEventListener('click', resetFilter);
saveBtn.addEventListener('click', saveImage);
fileInput.addEventListener('change', loadImage);
chooseBtn.addEventListener('click', () => fileInput.click());