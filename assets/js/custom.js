document.addEventListener('DOMContentLoaded', function() {
    // Common PXT/MakeCode UI elements to remove
    const uiElementsToHide = [
        // Editor and development UI
        '.monaco-editor',
        '.blocklyDiv',
        '.blocklyToolboxDiv',
        '#root > .ui.main.container',
        
        // Navigation and menus
        '.menubar',
        '.navbar',
        '.topbar',
        '#mainmenu',
        '.ui.menu',
        
        // Sidebars and panels
        '.sidebar',
        '.panel',
        '.explorer',
        '#filelist',
        
        // Toolbars and controls
        '.toolbar',
        '.controls',
        '.ui.segment',
        
        // Headers and footers
        'header',
        'footer',
        '.header',
        '.footer',
        
        // PXT specific elements
        '.simframe',
        '.simulator',
        '#boardview',
        '.ui.inverted.menu'
    ];
    
    // Hide all identified UI elements
    uiElementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = 'none';
        });
    });
    
    // Find and maximize the main app container
    const appSelectors = [
        '#app',
        '.app',
        '#main-app',
        '.main-content',
        '#content',
        '.app-container'
    ];
    
    let appContainer = null;
    for (const selector of appSelectors) {
        appContainer = document.querySelector(selector);
        if (appContainer) break;
    }
    
    if (appContainer) {
        // Make app full screen
        appContainer.style.position = 'fixed';
        appContainer.style.top = '0';
        appContainer.style.left = '0';
        appContainer.style.width = '100vw';
        appContainer.style.height = '100vh';
        appContainer.style.zIndex = '10000';
        appContainer.style.margin = '0';
        appContainer.style.padding = '0';
        appContainer.style.border = 'none';
        appContainer.style.background = '#000';
    }
    
    // Remove body margins and ensure full screen
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
});

// Additional cleanup for dynamically loaded content
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            // Hide any newly added UI elements
            const newElements = mutation.addedNodes;
            newElements.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && (
                        node.classList.contains('ui') ||
                        node.classList.contains('menu') ||
                        node.classList.contains('toolbar') ||
                        node.classList.contains('sidebar')
                    )) {
                        node.style.display = 'none';
                    }
                }
            });
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});