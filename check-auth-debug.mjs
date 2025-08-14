import { chromium } from 'playwright';

async function checkAuthDebug() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 访问认证调试页面...');
    await page.goto('https://smalltalking.netlify.app/auth-debug');
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 检查页面内容
    const title = await page.title();
    console.log('📄 页面标题:', title);
    
    // 检查是否有错误信息
    const errorElements = await page.$$('[class*="error"], [class*="Error"]');
    if (errorElements.length > 0) {
      console.log('❌ 发现错误元素:', errorElements.length, '个');
    }
    
    // 检查页面文本内容
    const pageText = await page.textContent('body');
    console.log('📝 页面内容片段:', pageText.substring(0, 500));
    
    // 检查控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 等待一下看是否有控制台错误
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('🚨 控制台错误:', consoleErrors);
    }
    
    // 截图保存
    await page.screenshot({ path: 'auth-debug-screenshot.png' });
    console.log('📸 截图已保存: auth-debug-screenshot.png');
    
  } catch (error) {
    console.error('❌ 检查页面失败:', error);
  } finally {
    await browser.close();
  }
}

checkAuthDebug();
