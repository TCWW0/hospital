<template>
  <div class="telemedicine-apply">
    <a-card class="apply-card">
      <div class="card-header">
        <h3>申请远程医疗</h3>
        <div class="card-sub">请填写病情并附上必要资料，工作人员将在 24 小时内处理</div>
      </div>
      <div class="card-body">
        <div class="form-viewport">
          <div class="form-row">
            <label class="col-label">选择就诊人</label>
            <div class="col-control">
              <a-select v-model:value="patientId" style="width:260px">
                <a-option v-for="p in patients" :key="p.id" :value="p.id">{{ p.name }} · {{ p.relation || '' }}</a-option>
              </a-select>
            </div>
          </div>

          <div class="form-row">
            <label class="col-label">病情描述（不超过 1200 字）</label>
            <div class="col-control">
              <div class="description-bg">
                <a-textarea v-model:value="description" :maxlength="1200" :autosize="{ minRows: 4, maxRows: 12 }" placeholder="请描述主要症状、既往史、用药与检查结果（可选）" />
              </div>
              <div class="muted">{{ description.length }} / 1200</div>
            </div>
          </div>

          <div class="form-row">
            <label class="col-label">附件（可选）</label>
            <div class="col-control">
              <div class="file-controls">
                <a-button size="medium" type="secondary" @click="triggerFileDialog">上传附件</a-button>
                <span class="hint muted">支持多文件，建议小于10MB</span>
              </div>
              <input ref="fileInput" class="hidden-file-input" type="file" multiple @change="onFileChange" />
              <div class="attachments">
                <div v-for="(f, idx) in attachments" :key="idx" class="attachment-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 8v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 8V6a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v2" stroke="#6b7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div class="fname">{{ f }}</div>
                  <a-space style="margin-left:auto"><a-button type="text" size="mini" @click="removeAttachment(idx)">删除</a-button></a-space>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a-button type="primary" size="large" @click="onSubmitClicked">提交申请</a-button>
        </div>
      </div>
    </a-card>

  <div class="apps-list">
      <h4>我的申请</h4>
      <div class="cards-viewport">
        <div class="cards">
          <a-card v-for="a in apps" :key="a.id" class="app-card">
            <div class="card-top">
              <div>
                <strong>{{ a.patientName }}</strong>
                <div class="muted">{{ formatTime(a.createdAt) }} · {{ methodLabel(a.preferredMethod) }}</div>
              </div>
              <div>
                <a-tag :type="a.status === 'pending' ? 'warning' : a.status === 'scheduled' ? 'success' : 'default'">{{ statusLabel(a.status) }}</a-tag>
              </div>
            </div>
            <div class="card-body">{{ a.description }}</div>
            <div class="card-actions" style="text-align:right;margin-top:4px">
              <a-button size="mini" type="text" @click="previewApp(a)">预览</a-button>
            </div>
          </a-card>
        </div>
      </div>
    </div>
  </div>

  <!-- 预览模态 -->
  <a-modal v-model:visible="showPreview" title="预览申请内容" width="720px" mask-closable>
    <div class="preview-body">
      <div class="preview-row"><strong>申请详情</strong></div>
      <table class="preview-table">
        <tbody>
          <tr>
            <th>就诊人</th>
            <td>{{ previewPayload?.patientName || previewPayload?.patient?.name }}<span v-if="previewPayload?.patient?.relation">（{{ previewPayload?.patient?.relation }}）</span></td>
          </tr>
          <tr>
            <th>联系方式</th>
            <td>{{ previewPayload?.patient?.phone || previewPayload?.applicant?.phone || previewPayload?.phone }}</td>
          </tr>
          <tr>
            <th>就诊方式</th>
            <td>{{ methodLabel(previewPayload?.preferredMethod) }}</td>
          </tr>
          <tr>
            <th>申请时间</th>
            <td>{{ formatTime(previewPayload?.createdAt) }}</td>
          </tr>
          <tr>
            <th>病情摘要</th>
            <td><div class="preview-desc">{{ previewPayload?.description }}</div></td>
          </tr>
          <tr>
            <th>附件</th>
            <td>
              <div v-if="previewPayload?.attachments?.length">
                <div v-for="(f, i) in previewPayload.attachments" :key="i" class="preview-attach">{{ f }}</div>
              </div>
              <div v-else class="muted">无附件</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <a-space style="width:100%; display:flex; justify-content:flex-end">
        <a-button size="large" @click="showPreview = false">关闭</a-button>
        <a-button v-if="previewPayload?.applicant" size="large" type="primary" :loading="submitting" @click="confirmSubmit">确认提交</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { fetchPatients } from '@/api/mock/patients';
import { createTelemedicineApplication, fetchTelemedicineApplications } from '@/api/mock/telemedicine';
import { Message } from '@arco-design/web-vue';

const patients = ref<any[]>([]);
const patientId = ref('');
const description = ref('');
const apps = ref<any[]>([]);
const attachments = ref<string[]>([]);

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
function statusLabel(status: string) {
  if (status === 'pending') return '待处理';
  if (status === 'scheduled') return '已安排';
  if (status === 'completed') return '已完成';
  return '未知';
}
function methodLabel(method: string) {
  if (method === 'video') return '视频问诊';
  if (method === 'phone') return '电话问诊';
  return '其他方式';
}

function previewApp(app: any) {
  previewPayload.value = app;
  showPreview.value = true;
}

// preview and submit flow
const showPreview = ref(false);
const previewPayload = ref<any>(null);
const submitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

async function load() {
  patients.value = await fetchPatients();
  if (!patientId.value && patients.value.length) patientId.value = patients.value[0].id;
  await loadApps();
}
async function loadApps() { apps.value = await fetchTelemedicineApplications(patientId.value || undefined); }
function onFileChange(e: Event) {
  const el = e.target as HTMLInputElement;
  if (!el.files) return;
  for (let i = 0; i < el.files.length; i++) {
    const f = el.files.item(i);
    if (f) attachments.value.push(f.name);
  }
  // reset input
  el.value = '';
}
function removeAttachment(idx: number) { attachments.value.splice(idx, 1); }
function triggerFileDialog(){ fileInput.value?.click(); }

function buildPreviewPayload(){
  // include account info mock
  const account = { userId: 'u123', name: '当前用户', phone: '13800000000' };
  const patient = patients.value.find(p=>p.id===patientId.value) || null;
  const payload = {
    applicant: account,
    patient: patient ? { id: patient.id, name: patient.name, phone: patient.phone, relation: patient.relation } : null,
    description: description.value,
    attachments: attachments.value.slice(),
    preferredMethod: 'video',
    createdAt: new Date().toISOString()
  };
  previewPayload.value = payload;
  return payload;
}

function onSubmitClicked(){
  // validation
  if (!patientId.value && patients.value.length) patientId.value = patients.value[0].id;
  if (!patientId.value) { Message.error('请选择就诊人'); return; }
  if (description.value.length > 1200) { Message.error('病情描述超过 1200 字限制'); return; }
  buildPreviewPayload();
  showPreview.value = true;
}

async function createApplication(){
  const created = await createTelemedicineApplication({ patientId: patientId.value, patientName: patients.value.find(p=>p.id===patientId.value)?.name, description: description.value, preferredMethod: 'video', attachments: attachments.value.slice() });
  apps.value.unshift(created);
  description.value = '';
  attachments.value = [];
  await loadApps();
  Message.success('申请已提交（mock）');
  return created;
}

async function confirmSubmit(){
  submitting.value = true;
  try{
    await createApplication();
    showPreview.value = false;
  }finally{
    submitting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.telemedicine-apply {
  padding: 16px;
}
.apply-card { max-width: 980px; margin: 0 auto 18px; border-radius:10px; box-shadow: 0 4px 18px rgba(12,45,89,0.06) }
.card-header{ display:flex; flex-direction:column; gap:6px }
.card-header h3{ margin:0 }
.card-sub{ color:#6b7280; font-size:13px }
.card-body{ padding:16px }
.form-viewport{ max-height: calc(100vh - 320px); overflow:auto; padding-right:8px }
.form-row{ display:flex; gap:16px; align-items:flex-start; margin-bottom:12px }
.col-label{ width:160px; font-weight:600 }
.col-control{ flex:1 }
.muted{ color:#6b7280; font-size:13px }
.attachments{ margin-top:8px }
.attachment-item{ display:flex; align-items:center; gap:8px; padding:8px; border-radius:6px; background:#f8fafc; border:1px solid rgba(11,102,179,0.06) }
.hidden-file-input{ display:none }
.file-controls{ display:flex; gap:12px; align-items:center }
.hint{ font-size:12px; color:#94a3b8 }
.description-bg{ padding:8px; border-radius:8px; background: #f8fafc; }
.preview-table{ width:100%; border-collapse:collapse; margin-top:12px }
.preview-table th{ text-align:left; width:140px; padding:8px 12px; vertical-align:top; color:#374151 }
.preview-table td{ padding:8px 12px }
.preview-desc{ white-space:pre-wrap; background:#fbfdff; padding:8px; border-radius:6px; border:1px solid #eef6ff }
.preview-attach{ display:inline-block; background:#eef6ff; color:#0b66b3; padding:6px 8px; border-radius:6px; margin-right:6px; margin-bottom:6px }
.form-actions{ text-align:right; margin-top:12px }
.apps-list{ max-width:980px; margin: 12px auto }
.cards-viewport{ max-height: 360px; overflow:auto; padding-right:8px }
.cards-viewport::-webkit-scrollbar{ width:10px }
.cards-viewport::-webkit-scrollbar-thumb{ background:#e6e6e6; border-radius:6px }
.app-card{ margin-bottom:12px }
.card-top{ display:flex; justify-content:space-between; align-items:center }
.card-body{ margin-top:8px }

@media (max-width: 900px){
  .form-row{ flex-direction:column }
  .col-label{ width:auto }
}
</style>
