<template>
  <div class="container">
    <h1>UUID QRコード生成アプリ</h1>

    <!-- 認証状態表示 -->
    <div class="auth-status" v-if="!isAuthenticated">
      <p>Google認証が必要です</p>
      <button @click="authenticate" class="btn btn-primary">Googleで認証</button>
    </div>
    <div class="auth-status authenticated" v-else>
      <p>✓ 認証済み</p>
    </div>

    <!-- UUID生成モード選択 -->
    <div class="mode-selection">
      <label>
        <input 
          type="radio" 
          v-model="mode" 
          value="auto" 
          @change="handleModeChange"
        />
        自動生成
      </label>
      <label>
        <input 
          type="radio" 
          v-model="mode" 
          value="manual" 
          @change="handleModeChange"
        />
        手動入力
      </label>
    </div>

    <!-- UUID入力エリア -->
    <div class="uuid-input-area">
      <div v-for="(uuid, index) in uuids" :key="index" class="uuid-item">
        <input
          v-model="uuids[index]"
          :placeholder="mode === 'auto' ? '自動生成されます' : 'UUIDを入力してください'"
          :readonly="mode === 'auto'"
          class="uuid-input"
        />
        <button 
          v-if="mode === 'manual' && uuids.length > 1" 
          @click="removeUuid(index)" 
          class="btn btn-danger btn-small"
        >
          削除
        </button>
      </div>

      <!-- 自動生成ボタン -->
      <button 
        v-if="mode === 'auto'" 
        @click="generateUuids" 
        class="btn btn-secondary"
      >
        UUIDを生成
      </button>

      <!-- 手動入力追加ボタン -->
      <button 
        v-if="mode === 'manual' && uuids.length < 10" 
        @click="addUuid" 
        class="btn btn-secondary"
      >
        UUIDを追加
      </button>
    </div>

    <!-- QRコードプレビュー -->
    <div class="qr-preview" v-if="uuids.length > 0 && uuids[0]">
      <h2>QRコードプレビュー（最初のUUID）</h2>
      <div class="qr-code-container">
        <img :src="qrCodeDataUrl" alt="QR Code" v-if="qrCodeDataUrl" />
      </div>
    </div>

    <!-- 保存ボタン -->
    <div class="actions">
      <button 
        @click="uploadToDrive" 
        :disabled="!canUpload || isUploading"
        class="btn btn-primary btn-large"
      >
        <span v-if="isUploading">アップロード中...</span>
        <span v-else>Googleドライブに保存</span>
      </button>
    </div>

    <!-- メッセージ表示 -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const mode = ref<'auto' | 'manual'>('auto');
const uuids = ref<string[]>(['']);
const qrCodeDataUrl = ref<string>('');
const isAuthenticated = ref(false);
const isUploading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const canUpload = computed(() => {
  return isAuthenticated.value && 
         uuids.value.length > 0 && 
         uuids.value.every(uuid => uuid.trim() !== '') &&
         !isUploading.value;
});

// UUIDの変更を監視してQRコードを更新
watch(() => uuids.value[0], async (newUuid) => {
  if (newUuid && newUuid.trim() !== '') {
    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(newUuid, {
        width: 300,
        margin: 1
      });
    } catch (error) {
      console.error('QRコード生成エラー:', error);
    }
  } else {
    qrCodeDataUrl.value = '';
  }
}, { immediate: true });

// 認証状態をチェック
const checkAuthStatus = async () => {
  try {
    const response = await $fetch<{ isAuthenticated: boolean }>('/api/auth/status');
    isAuthenticated.value = response.isAuthenticated;
  } catch (error) {
    isAuthenticated.value = false;
  }
};

// Google認証を開始
const authenticate = async () => {
  try {
    const response = await $fetch('/api/auth/google');
    if (response.authUrl) {
      window.location.href = response.authUrl;
    }
  } catch (error: any) {
    showMessage('認証エラー: ' + error.message, 'error');
  }
};

// モード変更時の処理
const handleModeChange = () => {
  if (mode.value === 'auto') {
    // 自動生成モードでは1つのUUIDを自動生成
    uuids.value = [uuidv4()];
  } else {
    // 手動入力モードでは空の入力欄を1つ
    uuids.value = [''];
  }
};

// UUIDを自動生成
const generateUuids = () => {
  const count = Math.min(10, uuids.value.length || 1);
  uuids.value = Array.from({ length: count }, () => uuidv4());
};

// UUIDを追加
const addUuid = () => {
  if (uuids.value.length < 10) {
    uuids.value.push('');
  }
};

// UUIDを削除
const removeUuid = (index: number) => {
  if (uuids.value.length > 1) {
    uuids.value.splice(index, 1);
  }
};

// Googleドライブにアップロード
const uploadToDrive = async () => {
  if (!canUpload.value) return;

  // 空のUUIDを除外
  const validUuids = uuids.value.filter(uuid => uuid.trim() !== '');
  
  if (validUuids.length === 0) {
    showMessage('UUIDが入力されていません', 'error');
    return;
  }

  isUploading.value = true;
  message.value = '';

  try {
    const response = await $fetch('/api/drive/upload', {
      method: 'POST',
      body: {
        uuids: validUuids
      }
    });

    showMessage(`アップロード成功: ${response.fileName}`, 'success');
    
    // 成功後、UUIDをクリア
    if (mode.value === 'auto') {
      uuids.value = [''];
    }
  } catch (error: any) {
    if (error.statusCode === 401) {
      isAuthenticated.value = false;
      showMessage('認証が必要です。再度認証してください。', 'error');
    } else {
      showMessage('アップロードエラー: ' + (error.message || error.data?.message || '不明なエラー'), 'error');
    }
  } finally {
    isUploading.value = false;
  }
};

// メッセージを表示
const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

onMounted(() => {
  checkAuthStatus();
  
  // URLパラメータで認証完了を検知
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'success') {
    checkAuthStatus();
    // URLからパラメータを削除
    window.history.replaceState({}, '', window.location.pathname);
  }
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

h2 {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 15px;
}

.auth-status {
  padding: 15px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.auth-status.authenticated {
  background-color: #d4edda;
  border-color: #28a745;
}

.mode-selection {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.mode-selection label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.uuid-input-area {
  margin-bottom: 30px;
}

.uuid-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.uuid-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.uuid-input:readonly {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.qr-preview {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
  text-align: center;
}

.qr-code-container {
  display: inline-block;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
}

.qr-code-container img {
  display: block;
}

.actions {
  text-align: center;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-large {
  padding: 15px 30px;
  font-size: 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
