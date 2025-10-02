<template>
  <div class="telemedicine-create">
    <div class="create-header">
      <a-button type="text" class="back-button" @click="goBack">
        <template #icon>
          <IconLeft />
        </template>
        返回远程医疗列表
      </a-button>
      <div class="header-text">
        <h2>新建远程医疗申请</h2>
        <p class="muted">请完善患者信息与会诊需求，提交后管理员将审核并安排合适的远程会诊资源。</p>
      </div>
    </div>

    <a-form ref="formRef" layout="vertical" :model="formModel" :rules="formRules" class="create-form">
      <div class="card-scroll" style="flex:1 1 auto;">
        <div class="card-stack">
          <a-card class="form-card" title="患者基础信息" size="large">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="patientName" label="患者姓名">
                  <a-input 
                      placeholder="例如：张三"
                      @update:model-value="(val: string) => formModel.patientName = val"
                      @change="console.log(formModel.patientName)"
                      allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="patientId" label="患者编号">
                  <a-input
                   placeholder="例如：patient-001"
                   @update:model-value="(val: string) => formModel.patientId = val"
                   @change="console.log(formModel.patientId)"
                   allow-clear />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item field="description" label="病情描述">
              <a-textarea
                :auto-size="{ minRows: 3, maxRows: 6 }"
                maxlength="1000"
                @update:model-value="(val: string) => formModel.description = val"
                placeholder="请简述患者现状、既往史以及希望专家协助的关注点"
              />
            </a-form-item>
          </a-card>

          <a-card class="form-card" title="会诊需求信息" size="large">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="serviceType" label="服务类型">
                  <a-radio-group v-model:value="formModel.serviceType" type="button">
                    <a-radio v-for="option in serviceTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="preferredMethod" label="期望会诊方式">
                  <a-select v-model:value="formModel.preferredMethod">
                    <a-option value="video">视频会诊</a-option>
                    <a-option value="phone">电话会诊</a-option>
                    <a-option value="text">图文会诊</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item field="supportTags" label="协同方式（可多选）">
              <a-checkbox-group v-model:value="formModel.supportTags">
                <a-checkbox v-for="option in supportTagOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="preferredDate" label="期望日期">
                  <a-date-picker
                    :value="formModel.preferredDate"
                    placeholder="选择期望日期"
                    :disabled-date="disablePastDate"
                    value-format="YYYY-MM-DD"
                    @update:model-value="(val: string)=> formModel.preferredDate = val"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="preferredTimeSlot" label="期望时间段">
                  <a-select
                    v-model:value="formModel.preferredTimeSlot"
                    placeholder="请选择期望时间段"
                    :disabled="!formModel.preferredDate || availableTimeSlots.length === 0"
                    allow-clear
                    @update:model-value="(val: string)=> formModel.preferredTimeSlot = val"
                  >
                    <a-option v-for="slot in availableTimeSlots" :key="slot" :value="slot">
                      {{ slot }}
                    </a-option>
                  </a-select>
                  <div v-if="formModel.preferredDate && availableTimeSlots.length === 0" class="slot-hint">
                    今日剩余时段已不可选，请选择其他日期。
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <!-- 病历资料保持不变 -->
          <a-card class="form-card" title="病历资料" size="large">
            <p class="muted" style="margin-bottom: 12px;">上传的文件仅用于演示，将记录文件名以便管理员与专家后续追踪，实际上传可接入院内文件服务。</p>
            <a-upload
              :auto-upload="false"
              :file-list="fileList"
              :on-change="handleUploadChange"
              :before-upload="blockUpload"
              list-type="text"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            >
              <a-button type="outline">
                <template #icon>
                  <IconUpload />
                </template>
                选择病历资料
              </a-button>
            </a-upload>
            <div v-if="fileList.length === 0" class="upload-placeholder">
              暂未选择文件，可上传检查报告、影像资料等辅助材料。
            </div>
          </a-card>
          <div class="form-actions">
            <a-space>
              <a-button @click="goBack">取消</a-button>
              <a-button type="primary" :loading="submitting" @click="handleSubmit">提交申请</a-button>
            </a-space>
          </div>
        </div>
      </div>

  </a-form>

  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconLeft, IconUpload } from '@arco-design/web-vue/es/icon';
import type { FormInstance } from '@arco-design/web-vue';
import type { FieldRule, ValidateTrigger } from '@arco-design/web-vue/es/form/interface';
import {
  createTelemedicineApplication,
  fetchTelemedicineDetail,
  type TelemedicineApp,
  type TelemedicineMethod,
  type TelemedicineServiceType,
  type TelemedicineSupportTag
} from '@/api/mock/telemedicine';
import { serviceTypeLabel, supportTagLabel } from '@/composables/useTelemedicineDetail';
import { useCurrentUser } from '@/composables/useCurrentUser';

const router = useRouter();
const detailLoading = ref(false);
const detailApp = ref<TelemedicineApp | null>(null);
const route = useRoute();

const { doctorProfile, currentUser } = useCurrentUser();

const doctorInfo = computed(() => {
  const profile = doctorProfile.value;
  if (profile) {
    return {
      id: profile.id != null ? String(profile.id) : '',
      name: profile.name,
      hospital: profile.hospital || '示例医院',
      expertId: profile.expertId,
      doctorRole: profile.doctorRole
    };
  }
  const fallback = currentUser.value;
  return {
    id: fallback?.id != null ? String(fallback.id) : '',
    name: fallback?.displayName || '未识别医生',
    hospital: fallback?.hospitalName || '示例医院',
    expertId: fallback?.expertId,
    doctorRole: fallback?.doctorRole
  };
});

const SERVICE_TYPES: TelemedicineServiceType[] = [
  'video_consult',
  'imaging_consult',
  'joint_clinic',
  'ward_round',
  'report_review'
];

const SUPPORT_TAGS: TelemedicineSupportTag[] = [
  'cloud_imaging',
  'cloud_lab',
  'multidisciplinary',
  'education',
  'pharmacy'
];

const serviceTypeOptions = SERVICE_TYPES.map((value) => ({ value, label: serviceTypeLabel(value) }));
const supportTagOptions = SUPPORT_TAGS.map((value) => ({ value, label: supportTagLabel(value) }));

const formRef = ref<FormInstance>();
const submitting = ref(false);
type LocalUploadFile = { uid: string; name?: string };
const fileList = ref<LocalUploadFile[]>([]);

const formModel = reactive({
  patientName: '',
  patientId: '',
  description: '',
  serviceType: SERVICE_TYPES[0] as TelemedicineServiceType,
  supportTags: [] as TelemedicineSupportTag[],
  preferredMethod: 'video' as TelemedicineMethod,
  preferredDate: '',
  preferredTimeSlot: ''
});

type FormModel = typeof formModel;
type FormField = keyof FormModel;

type ValidationContext = {
  field: FormField;
  value: unknown;
  model: FormModel;
};

type SyncValidator = (context: ValidationContext) => string | void;

type ValidatorConfig = {
  triggers?: ValidateTrigger[];
  validate: SyncValidator;
};

const INPUT_TRIGGERS: ValidateTrigger[] = ['change', 'blur'];
const CHANGE_ONLY_TRIGGERS: ValidateTrigger[] = ['change'];

async function loadDetail() {
  const id = route.params.id as string | undefined;
  if (!id) return;
  detailLoading.value = true;
  try {
    const detail = await fetchTelemedicineDetail(id);
    detailApp.value = detail;
  } finally {
    detailLoading.value = false;
  }
}

function normalizeText(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function requiredText(message: string): SyncValidator {
  return ({ value }) => {
    if (!normalizeText(value)) {
      return message;
    }
  };
}

function requiredSelection(message: string): SyncValidator {
  return ({ value }) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return message;
      return;
    }
    if (value === null || value === undefined) {
      return message;
    }
    if (typeof value === 'string' && !normalizeText(value)) {
      return message;
    }
  };
}

function minLengthValidator(min: number, message: string): SyncValidator {
  return ({ value }) => {
    const text = normalizeText(value);
    if (text && text.length < min) {
      return message;
    }
  };
}

function maxLengthValidator(max: number, message: string): SyncValidator {
  return ({ value }) => {
    const text = normalizeText(value);
    if (text && text.length > max) {
      return message;
    }
  };
}

function patternValidator(pattern: RegExp, message: string): SyncValidator {
  return ({ value }) => {
    const text = normalizeText(value);
    if (!text) return;
    if (!pattern.test(text)) {
      return message;
    }
  };
}

const validatorMap: Record<FormField, ValidatorConfig[]> = {
  patientName: [
    { triggers: INPUT_TRIGGERS, validate: requiredText('请输入患者姓名') },
    { triggers: INPUT_TRIGGERS, validate: minLengthValidator(2, '姓名至少需要 2 个字符') },
    { triggers: INPUT_TRIGGERS, validate: maxLengthValidator(20, '姓名不能超过 20 个字符') }
  ],
  patientId: [
    { triggers: INPUT_TRIGGERS, validate: requiredText('请输入患者编号') },
    { triggers: INPUT_TRIGGERS, validate: maxLengthValidator(50, '编号不能超过 50 个字符') },
    { triggers: INPUT_TRIGGERS, validate: patternValidator(/^[a-zA-Z0-9_-]+$/, '编号仅支持字母、数字、下划线或中划线') }
  ],
  description: [
    { triggers: INPUT_TRIGGERS, validate: requiredText('请输入病情描述') },
    { triggers: INPUT_TRIGGERS, validate: minLengthValidator(10, '病情描述不少于 10 个字符') },
    { triggers: INPUT_TRIGGERS, validate: maxLengthValidator(1000, '病情描述不能超过 1000 个字符') }
  ],
  serviceType: [
    { triggers: CHANGE_ONLY_TRIGGERS, validate: requiredSelection('请选择服务类型') }
  ],
  supportTags: [],
  preferredMethod: [
    { triggers: CHANGE_ONLY_TRIGGERS, validate: requiredSelection('请选择会诊方式') }
  ],
  preferredDate: [
    { triggers: CHANGE_ONLY_TRIGGERS, validate: requiredSelection('请选择期望日期') }
  ],
  preferredTimeSlot: [
    { triggers: CHANGE_ONLY_TRIGGERS, validate: requiredSelection('请选择期望时间段') },
    {
      triggers: CHANGE_ONLY_TRIGGERS,
      validate: ({ model, value }) => {
        const slot = normalizeText(value);
        if (!slot) return;
        if (!normalizeText(model.preferredDate)) {
          return '请先选择期望日期';
        }
      }
    }
  ]
};

function buildFieldRules(field: FormField) {
  return validatorMap[field].map(({ triggers, validate }) => ({
    trigger: triggers ?? INPUT_TRIGGERS,
    validator: (value: unknown) => {
      const message = validate({ field, value, model: formModel });
      return message ? Promise.reject(message) : Promise.resolve();
    }
  }));
}

const formRules = reactive<Record<FormField, FieldRule[]>>(
  (Object.keys(validatorMap) as FormField[]).reduce((rules, field) => {
    rules[field] = buildFieldRules(field);
    return rules;
  }, {} as Record<FormField, FieldRule[]>)
);

function rebuildFieldRules(field: FormField) {
  formRules[field] = buildFieldRules(field);
}

function registerFieldValidator(field: FormField, validator: ValidatorConfig | ValidatorConfig[]) {
  const validators = Array.isArray(validator) ? validator : [validator];
  validatorMap[field] = [...validatorMap[field], ...validators];
  rebuildFieldRules(field);
  triggerFieldValidation(field);
}

function replaceFieldValidators(field: FormField, validators: ValidatorConfig[]) {
  validatorMap[field] = [...validators];
  rebuildFieldRules(field);
  triggerFieldValidation(field);
}

function triggerFieldValidation(field: FormField) {
  if (!formRef.value) return;
  formRef.value.clearValidate([field]);
  formRef.value.validateField(field).catch(() => undefined);
}

const autoValidateFields: FormField[] = ['patientName', 'patientId', 'description'];

autoValidateFields.forEach((field) => {
  watch(
    () => formModel[field],
    () => {
      triggerFieldValidation(field);
    },
    { flush: 'post' }
  );
});

defineExpose({
  registerFieldValidator,
  replaceFieldValidators,
  triggerFieldValidation
});

// 计算属性
const baseTimeSlots = computed(() => generateTimeSlots());
const availableTimeSlots = computed(() => {
  if (!formModel.preferredDate) {
    return [] as string[];
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${formModel.preferredDate}T00:00:00`);
  selected.setHours(0, 0, 0, 0);
  const isSameDay = selected.getTime() === today.getTime();
  if (!isSameDay) {
    return baseTimeSlots.value;
  }
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return baseTimeSlots.value.filter((slot) => {
    const [hourStr, minuteStr] = slot.split(':');
    const hour = Number(hourStr || 0);
    const minute = Number(minuteStr || 0);
    const slotMinutes = hour * 60 + minute;
    return slotMinutes > nowMinutes;
  });
});

// 工具函数
function generateTimeSlots(intervalMinutes = 30, startHour = 8, endHour = 20) {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) {
        break;
      }
      const h = String(hour).padStart(2, '0');
      const m = String(minute).padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

function disablePastDate(current: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return current.getTime() < today.getTime();
}

// 监听日期变化，清除时间段
watch(
  () => formModel.preferredDate,
  (newDate, oldDate) => {
    if (normalizeText(newDate) === normalizeText(oldDate)) {
      return;
    }
    triggerFieldValidation('preferredDate');
    formModel.preferredTimeSlot = '';
    formRef.value?.clearValidate(['preferredTimeSlot']);
  }
);

// 文件上传处理
function handleUploadChange(files: LocalUploadFile[]) {
  fileList.value = files;
}

function blockUpload() {
  return false;
}

// 提交处理
async function handleSubmit() {
  try {
    // 验证所有字段
    await formRef.value?.validate();
  } catch (error) {
    // Arco Design 的 validate 在验证失败时会抛出错误
    Message.warning('请完善表单信息后再提交');
    return;
  }

  submitting.value = true;
  try {
    const patientId = normalizeText(formModel.patientId);
    const patientName = normalizeText(formModel.patientName);
    const description = normalizeText(formModel.description);
    const preferredDate = normalizeText(formModel.preferredDate);
    const preferredSlot = normalizeText(formModel.preferredTimeSlot);

    const attachments = fileList.value
      .map((file) => normalizeText(file.name))
      .filter((name): name is string => name.length > 0);

    const preferredTime = preferredDate && preferredSlot ? `${preferredDate} ${preferredSlot}` : undefined;

    const doctor = doctorInfo.value;

    if (!doctor.id) {
      Message.error('未获取到医生账号信息，请重新登录后再试');
      return;
    }

    await createTelemedicineApplication({
      patientId,
      patientName,
      description,
      attachments,
      preferredMethod: formModel.preferredMethod,
      preferredTime,
      serviceType: formModel.serviceType,
      supportTags: [...formModel.supportTags],
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorHospital: doctor.hospital
    });

    Message.success('远程医疗申请已提交，等待管理员审核');
    router.replace({ name: 'DoctorTelemedicine' });
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push({ name: 'DoctorTelemedicine' });
}

watch(
  () => route.params.id,
  () => loadDetail(),
  { immediate: true }
);

</script>

<style scoped>
.telemedicine-create {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

.create-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-button {
  align-self: flex-start;
  padding-left: 0;
  color: #1d4ed8;
}

.header-text h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.muted {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.card-scroll {
  flex: 1;
  overflow: auto;
  display: flex;
  padding-right: 12px;
  margin-right: -12px;
  min-height: 200px;
  max-height: calc(100vh - 225px);
}

.card-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.upload-placeholder {
  margin-top: 12px;
  color: #94a3b8;
  font-size: 13px;
  margin-top: 15px;
}

.slot-hint {
  margin-top: 6px;
  color: #ef4444;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.9) 80%);
}

@media (max-width: 768px) {
  .form-card {
    box-shadow: none;
  }
}
</style>
