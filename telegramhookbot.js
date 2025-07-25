
        
        <!-- Telegram Bot Content -->
        <div id="telegram" class="tab-content">
            <div class="bot-container telegram">
                <div class="bot-header">
                    <div class="bot-icon">
                        <i class="fab fa-telegram"></i>
                    </div>
                    <div class="bot-info">
                        <h2>Telegram Bot 实现</h2>
                        <p>在Telegram中自动绕过Codex密钥系统</p>
                    </div>
                </div>
                
                <div class="code-container">
                    <div class="code-header">
                        <div class="code-title">telegram_bot.js</div>
                        <button class="copy-btn" onclick="copyCode('telegram-code')">
                            <i class="fas fa-copy"></i> 复制代码
                        </button>
                    </div>
                    <pre id="telegram-code"><code>const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('8209508150:AAGWx5QBrU1C_lZkmsQpvWmrgtZxX65izFk');

// 用户会话存储
const userSessions = new Map();

// 辅助函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 开始命令
bot.command('start', (ctx) => {
  ctx.reply(`欢迎使用Codex绕过机器人! 🚀\n发送您的Codex链接开始绕过流程`);
});

// 处理Codex链接
bot.hears(/(https?:\/\/[^\s]+)/, async (ctx) => {
  const url = ctx.message.text;
  
  // 从URL中提取ID
  const idRegex = /\/key\/([a-f0-9-]+)/i;
  const idMatch = url.match(idRegex);
  
  if (!idMatch || !idMatch[1]) {
    return ctx.reply('无法从链接中提取ID，请提供有效的Codex链接');
  }
  
  const sessionId = idMatch[1];
  ctx.reply(`开始Codex绕过流程...\n提取的会话ID: ${sessionId}`);
  
  // 创建用户会话
  userSessions.set(ctx.from.id, {
    sessionId,
    status: 'processing',
    stages: [],
    validatedTokens: []
  });
  
  const session = userSessions.get(ctx.from.id);
  
  try {
    // 获取阶段
    const stagesResponse = await axios.get('https://api.codex.lol/v1/stage/stages', {
      headers: { 'Android-Session': session.sessionId }
    });
    
    if (stagesResponse.data.success && stagesResponse.data.stages) {
      session.stages = stagesResponse.data.stages;
      session.status = 'processing_stages';
      ctx.reply(`找到 ${session.stages.length} 个需要处理的阶段`);
      
      // 处理每个阶段
      for (let i = 0; i < session.stages.length; i++) {
        const stage = session.stages[i];
        ctx.reply(`处理阶段 ${i+1}/${session.stages.length}...`);
        
        // 初始化阶段
        const initiateResponse = await axios.post('https://api.codex.lol/v1/stage/initiate', {
          stageId: stage.uuid
        }, {
          headers: {
            'Android-Session': session.sessionId,
            'Content-Type': 'application/json'
          }
        });
        
        if (initiateResponse.data.success) {
          const token = initiateResponse.data.token;
          await sleep(6000); // 等待6秒
          
          // 基于token确定referrer
          const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          let referrer = 'https://linkvertise.com/';
          if (tokenData.link.includes('loot-links')) referrer = 'https://loot-links.com/';
          if (tokenData.link.includes('loot-link')) referrer = 'https://loot-link.com/';
          
          // 验证阶段
          const validateResponse = await axios.post('https://api.codex.lol/v1/stage/validate', {
            token
          }, {
            headers: {
              'Android-Session': session.sessionId,
              'Content-Type': 'application/json',
              'Task-Referrer': referrer
            }
          });
          
          if (validateResponse.data.success) {
            session.validatedTokens.push({
              uuid: stage.uuid,
              token: validateResponse.data.token
            });
            ctx.reply(`✅ 阶段 ${i+1} 完成!`);
          }
        }
        await sleep(1500); // 阶段间等待
      }
      
      // 所有阶段完成后进行认证
      const authResponse = await axios.post('https://api.codex.lol/v1/stage/authenticate', {
        tokens: session.validatedTokens
      }, {
        headers: {
          'Android-Session': session.sessionId,
          'Content-Type': 'application/json'
        }
      });
      
      if (authResponse.data.success) {
        ctx.reply('🎉 绕过成功! 您现在可以访问Codex的高级功能。');
        userSessions.delete(ctx.from.id);
      }
    }
  } catch (error) {
    console.error(error);
    ctx.reply(`❌ 错误: ${error.message}`);
  }
});

// 状态命令
bot.command('status', (ctx) => {
  if (userSessions.has(ctx.from.id)) {
    const session = userSessions.get(ctx.from.id);
    ctx.reply(`当前状态: ${session.status}\n已完成阶段: ${session.validatedTokens.length}/${session.stages.length}`);
  } else {
    ctx.reply('没有活动的会话。发送您的Codex链接开始。');
  }
});

// 启动机器人
bot.launch();</code></pre>
                </div>
                
                <div class="command-list">
                    <h3><i class="fas fa-terminal"></i> 使用方法</h3>
                    <div class="command">
                        <i class="fas fa-link"></i>
                        <span class="cmd">发送Codex链接</span>
                        <span class="desc">机器人会自动提取ID并开始绕过流程</span>
                    </div>
                    <div class="command">
                        <i class="fas fa-sync"></i>
                        <span class="cmd">/status</span>
                        <span class="desc">检查当前绕过状态</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="credits">
            <p>基于原始Codex Bypasser用户脚本 - SaHaL1NeZ (原始: idontgiveaf; d15c0rdh4ckr)</p>
            <p>适配为Discord和Telegram机器人</p>
        </div>
    </div>

    <script>
        // 标签切换功能
        function openTab(tabName) {
            // 隐藏所有标签内容
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // 移除所有按钮的活动状态
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 显示选中的标签内容
            document.getElementById(tabName).classList.add('active');
            
            // 激活点击的按钮
            document.querySelector(`.tab-btn.${tabName}`).classList.add('active');
        }
        
        // 复制代码功能
        function copyCode(elementId) {
            const codeElement = document.getElementById(elementId);
            const textArea = document.createElement('textarea');
            textArea.value = codeElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // 显示复制成功通知
            const copyBtn = document.querySelector(`[onclick="copyCode('${elementId}')"]`);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制!';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    </script>
</body>
</html>