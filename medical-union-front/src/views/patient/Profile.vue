<template>
  <div class="patient-profile">
    <h2>个人信息</h2>
    
  <a-form class="profile-form" :model="form" label-align="left" label-col="6" layout="vertical">
      <div class="form-section">
        <h3>基本信息</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" field="name">
              <a-input v-model="form.name" placeholder="请输入真实姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" field="gender">
              <a-select v-model="form.gender" placeholder="请选择性别">
                <a-option value="MALE">男</a-option>
                <a-option value="FEMALE">女</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="证件号" field="idNumber">
              <a-input v-model="form.idNumber" placeholder="身份证号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="出生日期" field="birthDate">
              <a-date-picker v-model="form.birthDate" placeholder="请选择出生日期" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div class="form-section">
        <h3>联系方式</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="联系电话" field="phone">
              <a-input v-model="form.phone" placeholder="手机号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="居住地址" field="address">
              <a-input v-model="form.address" placeholder="详细地址" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="紧急联系人" field="emergencyContact">
              <a-input v-model="form.emergencyContact" placeholder="紧急联系人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="紧急联系电话" field="emergencyPhone">
              <a-input v-model="form.emergencyPhone" placeholder="紧急联系人电话" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div class="form-actions">
        <a-space>
          <a-button type="primary" :loading="saving" @click="save" size="large">
            {{ saving ? '保存中...' : '保存信息' }}
          </a-button>
          <a-button @click="reset" size="large">重置</a-button>
          <a-button type="outline" @click="openPwd" size="large">修改密码</a-button>
        </a-space>
      </div>
    </a-form>

    <a-modal v-model:visible="pwdVisible" title="修改密码" :mask-closable="false">
      <a-form :model="pwdForm" label-align="left" label-col="6">
        <a-form-item label="旧密码">
          <a-input-password v-model="pwdForm.oldPassword" placeholder="请输入旧密码" />
        </a-form-item>
        <a-form-item label="新密码">
          <a-input-password v-model="pwdForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="pwdVisible=false">取消</a-button>
          <a-button type="primary" :loading="pwdSaving" @click="changePwd">确定</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';

const form = ref({ 
  name: '', 
  idNumber: '', 
  phone: '', 
  gender: 'MALE',
  birthDate: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '' 
});
const saving = ref(false);

const pwdVisible = ref(false);
const pwdForm = ref({ oldPassword: '', newPassword: '' });
const pwdSaving = ref(false);

// Mock 数据加载
function loadMockData() {
  const saved = localStorage.getItem('medical_union_patient_profile');
  if (saved) {
    try {
      Object.assign(form.value, JSON.parse(saved));
    } catch (e) {
      console.warn('加载本地数据失败:', e);
    }
  } else {
    // 默认演示数据
    const user = JSON.parse(localStorage.getItem('medical_union_user') || '{}');
    form.value = {
      name: user.name || '张三',
      idNumber: '445280200511031573',
      phone: '13430040162',
      gender: 'MALE',
      birthDate: '1985-06-15',
      address: '广东省深圳市南山区科技园',
      emergencyContact: '李四',
      emergencyPhone: '13800000000'
    };
  }
}

async function save() {
  if (!form.value.name || !form.value.phone) {
    Message.warning('请填写姓名和联系电话');
    return;
  }
  
  saving.value = true;
  
  // 模拟保存延时
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    localStorage.setItem('medical_union_patient_profile', JSON.stringify(form.value));
    
    // 同时更新用户基础信息
    const user = JSON.parse(localStorage.getItem('medical_union_user') || '{}');
    user.name = form.value.name;
    localStorage.setItem('medical_union_user', JSON.stringify(user));
    
    Message.success('个人信息保存成功');
  } catch (e) {
    Message.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
}

function reset() {
  localStorage.removeItem('medical_union_patient_profile');
  loadMockData();
  Message.info('已重置为默认信息');
}

function openPwd() { 
  pwdVisible.value = true; 
  pwdForm.value = { oldPassword: '', newPassword: '' };
}

async function changePwd() {
  if (!pwdForm.value.oldPassword || !pwdForm.value.newPassword) {
    Message.warning('请输入旧密码与新密码');
    return;
  }
  
  if (pwdForm.value.newPassword.length < 6) {
    Message.warning('新密码至少6个字符');
    return;
  }
  
  pwdSaving.value = true;
  
  // 模拟密码修改延时
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // 模拟密码验证（演示用）
    if (pwdForm.value.oldPassword === 'wrongpass') {
      Message.error('旧密码不正确');
      return;
    }
    
    Message.success('密码修改成功，请妥善保管新密码');
    pwdVisible.value = false;
    pwdForm.value = { oldPassword: '', newPassword: '' };
  } catch (e) {
    Message.error('修改密码失败，请稍后重试');
  } finally {
    pwdSaving.value = false;
  }
}

onMounted(() => { 
  loadMockData(); 
});
</script>

<style lang="less" scoped>
.patient-profile {
  width: min(100%, calc(100% * 2 / 3));
  max-width: 1120px;
  margin: 0 auto 32px;
  padding: 32px 36px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
  border-radius: 18px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 32px 62px -36px rgba(15, 23, 42, 0.55), 0 18px 44px -32px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: calc(100vh - 160px);
  overflow: hidden;
  align-self: center;
}

.profile-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  padding-right: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(17, 24, 39, 0.32) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(17, 24, 39, 0.32);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(15, 23, 42, 0.48);
  }
}

.patient-profile h2 { 
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}


.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #3b82f6;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

@media (max-width: 1280px) {
  .patient-profile {
    width: min(100%, 80%);
    margin: 0 auto 28px;
  }
}

@media (max-width: 1024px) {
  .patient-profile {
    width: 100%;
    margin: 0 auto 24px;
    max-height: calc(100vh - 120px);
  }
}

@media (max-width: 768px) {
  .patient-profile {
    padding: 24px;
    max-height: none;
    box-shadow: 0 18px 40px -26px rgba(15, 23, 42, 0.4);
    margin: 0 auto 20px;
  }

  .profile-form {
    padding-right: 0;
  }

  .form-actions {
    text-align: left;
  }
}
</style>