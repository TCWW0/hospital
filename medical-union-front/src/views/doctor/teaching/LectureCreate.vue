<template>
  <div class="lecture-create-page" :style="rootVars">
    <a-page-header
      class="page-header"
      title="发起远程教学讲座"
      subtitle="填写讲座关键信息，提交后进入审核流程"
      @back="goBack"
    />

    <div class="create-body">
      <a-form
        ref="formRef"
        class="create-form"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <div class="create-layout scrollable">
          <a-card class="section-card" title="讲座基础信息" :bordered="false">
            <div class="card-grid">
              <a-form-item field="title" label="讲座标题" required>
                <a-input v-model="form.title" placeholder="例如：基层心血管疾病规范化诊疗" />
              </a-form-item>
              <a-form-item field="category" label="讲座类型" required>
                <a-select v-model="form.category" placeholder="请选择讲座类型">
                  <a-option value="teaching_discussion">教学讨论</a-option>
                  <a-option value="ward_round">查房教学</a-option>
                  <a-option value="knowledge_share">知识库共享</a-option>
                  <a-option value="lecture_training">远程讲座培训</a-option>
                  <a-option value="surgery_live">手术直播/点播</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="targetAudience" label="目标受众" required>
                <a-select v-model="form.targetAudience" placeholder="请选择受众">
                  <a-option value="medical_staff">医务人员</a-option>
                  <a-option value="patients">患者/公众</a-option>
                  <a-option value="mixed">医患混合</a-option>
                </a-select>
              </a-form-item>
              <a-form-item field="visibility" label="可见范围" required>
                <a-radio-group
                  v-model="form.visibility"
                  direction="vertical"
                  class="visibility-radio-group"
                >
                  <a-radio
                    v-for="option in visibilityOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    <div class="visibility-option">
                      <div class="visibility-option__title">{{ option.label }}</div>
                      <div class="visibility-option__desc">
                        {{ option.description }}
                        <span class="visibility-option__hint">建议受众：{{ lectureAudienceLabel(option.recommendedAudience) }}</span>
                      </div>
                    </div>
                  </a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item field="tags" label="标签">
                <a-input-tag
                  v-model="form.tags"
                  placeholder="输入后回车创建标签"
                />
              </a-form-item>
            </div>
          </a-card>

          <a-card class="section-card" title="时间与范围" :bordered="false">
            <div class="card-grid">
              <a-form-item field="plannedAt" label="计划时间">
                <a-date-picker
                  v-model="form.plannedAt"
                  show-time
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  style="width: 100%"
                  placeholder="选择计划开课时间"
                />
              </a-form-item>
              <a-form-item field="durationMinutes" label="预计时长 (分钟)">
                <a-input-number v-model="form.durationMinutes" :min="30" :max="240" :step="15" style="width: 100%" />
              </a-form-item>
            </div>
          </a-card>

          <a-card class="section-card" title="内容简介" :bordered="false">
            <div class="card-grid">
              <a-form-item field="summary" label="讲座简介" required class="full-width">
                <a-textarea
                  v-model="form.summary"
                  :auto-size="{ minRows: 4, maxRows: 6 }"
                  placeholder="介绍讲座背景、核心内容与价值"
                />
              </a-form-item>
              <a-form-item field="objectivesText" label="教学目标" class="full-width">
                <a-textarea
                  v-model="form.objectivesText"
                  :auto-size="{ minRows: 3, maxRows: 5 }"
                  placeholder="用换行分隔多个教学目标"
                />
              </a-form-item>
            </div>
          </a-card>

          <a-card class="section-card" title="主讲专家信息" :bordered="false">
            <div class="card-grid">
              <a-form-item field="lecturer.name" label="主讲专家" required>
                <a-input v-model="form.lecturer.name" placeholder="例如：周兰" />
              </a-form-item>
              <a-form-item field="lecturer.title" label="专家职称">
                <a-input v-model="form.lecturer.title" placeholder="主任医师 / 副主任医师" />
              </a-form-item>
              <a-form-item field="lecturer.specialty" label="擅长领域">
                <a-input v-model="form.lecturer.specialty" placeholder="心血管内科 / 呼吸科" />
              </a-form-item>
              <a-form-item field="lecturer.hospital" label="所在医院">
                <a-input v-model="form.lecturer.hospital" placeholder="专家所属医院名称" />
              </a-form-item>
            </div>
          </a-card>

          <a-card class="section-card" title="提交信息" :bordered="false">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="申请人">{{ organizerName }}</a-descriptions-item>
              <a-descriptions-item label="所属机构">{{ organizerHospital }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <div class="form-actions">
          <a-space>
            <a-button @click="goBack">取消</a-button>
            <a-button type="primary" :loading="submitting" @click="handleSubmit">提交审核</a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  createTeachingLecture,
  type CreateTeachingLecturePayload,
  type LectureVisibility,
  type LectureAudience
} from '@/api/mock/teaching';
import { useCurrentUser } from '@/composables/useCurrentUser';
import { lectureAudienceLabel, useLectureVisibilityOptions } from '@/composables/useTeachingLecture';

const router = useRouter();
const { doctorProfile, currentUser } = useCurrentUser();

type FormValidationTrigger = 'blur' | 'change' | 'focus' | 'input';

type FormRuleValidator = (value: unknown, callback: (error?: string) => void) => void | Promise<void>;

interface FormRule {
  trigger?: FormValidationTrigger | FormValidationTrigger[];
  validator: FormRuleValidator;
}

type FormRules = Record<string, FormRule[]>;

interface ValidatedError {
  field: string;
  message: string;
}

type FormValidateResult = Record<string, ValidatedError> | undefined;

interface FormInstance {
  validate: () => Promise<FormValidateResult>;
  scrollToField?: (field: string) => void;
}

const formRef = ref<FormInstance>();

const organizerName = computed(() => doctorProfile.value?.name ?? currentUser.value?.displayName ?? '尚未识别');
const organizerHospital = computed(
  () => doctorProfile.value?.hospital ?? currentUser.value?.hospitalName ?? '待完善'
);
const organizerExpertId = computed(
  () => doctorProfile.value?.expertId ?? currentUser.value?.expertId ?? doctorProfile.value?.id
);

const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 900);
const cardScrollOffset = 240;
const minScrollHeight = 360;
const cardScrollHeight = computed(() => Math.max(minScrollHeight, viewportHeight.value - cardScrollOffset));
const rootVars = computed(() => ({ '--teaching-scroll-height': `${cardScrollHeight.value}px` }));

function handleResize() {
  viewportHeight.value = window.innerHeight;
}

type TeachingFormModel = CreateTeachingLecturePayload & { objectivesText: string };

const form = reactive<TeachingFormModel>({
  title: '',
  category: 'lecture_training',
  targetAudience: 'medical_staff',
  visibility: 'internal',
  summary: '',
  objectives: [],
  objectivesText: '',
  tags: [],
  plannedAt: undefined,
  durationMinutes: 90,
  organizerId: organizerExpertId.value ? String(organizerExpertId.value) : 'doctor-temp',
  organizerName: organizerName.value,
  organizerHospital: organizerHospital.value,
  organizerDepartment: undefined,
  lecturer: {
    id: organizerExpertId.value ? String(organizerExpertId.value) : 'lecturer-temp',
    name: organizerName.value
  }
});

interface VisibilityOption {
  value: LectureVisibility;
  label: string;
  description: string;
  recommendedAudience: LectureAudience;
}

const baseVisibilityOptions = useLectureVisibilityOptions();

const visibilityOptions = computed<VisibilityOption[]>(() =>
  baseVisibilityOptions.value.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description ?? '',
    recommendedAudience: option.value === 'public' ? 'mixed' : 'medical_staff'
  }))
);

const submitting = ref(false);

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

watch(organizerExpertId, (val) => {
  if (!val) return;
  form.organizerId = String(val);
  if (!form.lecturer.id || form.lecturer.id === 'lecturer-temp') {
    form.lecturer.id = String(val);
  }
});

watch(organizerName, (val) => {
  form.organizerName = val;
  if (!form.lecturer.name) {
    form.lecturer.name = val;
  }
});

watch(organizerHospital, (val) => {
  form.organizerHospital = val;
});

watch(
  () => form.visibility,
  (visibility) => {
    if ((visibility === 'private' || visibility === 'internal') && form.targetAudience !== 'medical_staff') {
      form.targetAudience = 'medical_staff';
      Message.info('已自动切换为“医务人员”受众以匹配内部可见范围');
    }
    if (visibility === 'network' && form.targetAudience === 'patients') {
      form.targetAudience = 'medical_staff';
      Message.info('医联体范围仅支持医务人员或医患混合，已自动调整');
    }
    if (visibility === 'public' && form.targetAudience === 'medical_staff') {
      form.targetAudience = 'mixed';
      Message.info('面向公众建议选择“医患混合”，已自动调整');
    }
  }
);

const ruleSchemas: Record<string, Array<{
  label: string;
  type?: 'text' | 'select' | 'radio' | 'array' | 'number';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  custom?: (value: unknown) => string | void | Promise<string | void>;
}>> = {
  title: [{ label: '讲座标题', type: 'text', required: true, minLength: 4 }],
  category: [{ label: '讲座类型', type: 'select', required: true }],
  targetAudience: [{
    label: '目标受众',
    type: 'select',
    required: true,
    custom: (value) => {
      if (typeof value !== 'string') return '请选择目标受众';
      if ((form.visibility === 'private' || form.visibility === 'internal') && value === 'patients') {
        return '内部可见范围不支持患者/公众，请调整可见范围或受众类型';
      }
      if (form.visibility === 'private' && value === 'mixed') {
        return '私有讲座仅对组织团队开放，不支持医患混合受众';
      }
      if (form.visibility === 'public' && value === 'medical_staff') {
        return '公开讲座需至少面向患者或医患混合，请调整目标受众';
      }
    }
  }],
  visibility: [{ label: '可见范围', type: 'radio', required: true }],
  tags: [{
    label: '标签',
    type: 'array',
    required: true,
    custom: (value) => {
      if (!Array.isArray(value)) return '请至少添加一个标签';
      if (!value.length) return '请至少添加一个标签';
      if (value.length > 5) return '标签数量不超过 5 个';
    }
  }],
  plannedAt: [{
    label: '计划时间',
    required: true,
    custom: (value) => {
      if (!value) return '请选择计划时间';
      const normalized = typeof value === 'string' ? value.replace(' ', 'T') : String(value);
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return '计划时间格式无效';
      if (date.getTime() < Date.now()) return '计划时间需晚于当前时间';
    }
  }],
  durationMinutes: [{
    label: '预计时长',
    type: 'number',
    required: true,
    custom: (value) => {
      const duration = Number(value);
      if (Number.isNaN(duration)) return '请输入合法的时长';
      if (duration < 30 || duration > 240) return '时长需在 30-240 分钟之间';
    }
  }],
  summary: [{ label: '讲座简介', type: 'text', required: true, minLength: 10 }],
  objectivesText: [{
    label: '教学目标',
    type: 'text',
    required: true,
    custom: (value) => {
      const text = typeof value === 'string' ? value.trim() : '';
      if (!text) return '请填写至少一个教学目标';
      const lines = text
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      if (!lines.length) return '请填写至少一个教学目标';
      if (lines.some((line) => line.length < 4)) return '每个教学目标不少于 4 个字符';
    }
  }],
  'lecturer.name': [{ label: '主讲专家', type: 'text', required: true, minLength: 2 }],
  'lecturer.title': [{ label: '专家职称', type: 'text', required: true, minLength: 2 }],
  'lecturer.specialty': [{ label: '擅长领域', type: 'text', required: true, minLength: 2 }],
  'lecturer.hospital': [{ label: '所在医院', type: 'text', required: true, minLength: 2 }]
};

function createRule(option: {
  label: string;
  type?: 'text' | 'select' | 'radio' | 'array' | 'number';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  custom?: (value: unknown) => string | void | Promise<string | void>;
}): FormRule {
  return {
    validator: (value: unknown, callback) => {
      const trimmed = typeof value === 'string' ? value.trim() : value;
      const fail = (message: string) => {
        callback(message);
      };
      const succeed = () => {
        callback();
      };

      if (option.required) {
        const hasValue = option.type === 'array'
          ? Array.isArray(trimmed) && trimmed.length > 0
          : option.type === 'number'
            ? typeof trimmed === 'number' && !Number.isNaN(trimmed)
            : trimmed !== undefined && trimmed !== null && trimmed !== '';
        if (!hasValue) {
          const action = option.type === 'select' || option.type === 'radio' ? '请选择' : '请填写';
          fail(`${action}${option.label}`);
          return;
        }
      }

      if (option.minLength && typeof trimmed === 'string' && trimmed.length < option.minLength) {
        fail(`${option.label}不少于 ${option.minLength} 个字符`);
        return;
      }

      if (option.maxLength && typeof trimmed === 'string' && trimmed.length > option.maxLength) {
        fail(`${option.label}不超过 ${option.maxLength} 个字符`);
        return;
      }

      if (option.custom) {
        try {
          const customResult = option.custom(trimmed);
          if (customResult instanceof Promise) {
            customResult
              .then((message) => {
                if (typeof message === 'string' && message) {
                  fail(message);
                } else {
                  succeed();
                }
              })
              .catch((error) => {
                const fallback = error instanceof Error ? error.message : '校验失败，请稍后重试';
                fail(fallback);
              });
            return;
          }
          if (typeof customResult === 'string' && customResult) {
            fail(customResult);
            return;
          }
        } catch (error) {
          const fallback = error instanceof Error ? error.message : '校验失败，请稍后重试';
          fail(fallback);
          return;
        }
      }

      succeed();
    },
    trigger: option.type === 'radio' || option.type === 'select' || option.type === 'array'
      ? (['change'] as FormValidationTrigger[])
      : (['blur', 'change'] as FormValidationTrigger[])
  };
}

function buildRules(schema: typeof ruleSchemas): FormRules {
  const result: FormRules = {};
  Object.entries(schema).forEach(([field, validators]) => {
    result[field] = validators.map((validatorOption) => createRule(validatorOption));
  });
  return result;
}

const rules = reactive<FormRules>(buildRules(ruleSchemas));

function normalizeObjectives() {
  const text = form.objectivesText.trim();
  const objectives = text
    ? text
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  form.objectives = objectives;
  form.objectivesText = objectives.join('\n');
}

function toIsoString(value: string) {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }
  return date.toISOString();
}

async function handleSubmit() {
  normalizeObjectives();
  const validationResult = await formRef.value?.validate();
  if (validationResult) {
    const [firstField, firstError] = Object.entries(validationResult)[0] ?? [];
    const message = firstError?.message ?? '请先修正表单中的提示项';
    Message.error(message);
    if (firstField) {
      formRef.value?.scrollToField?.(firstField);
    }
    return;
  }

  if (!form.organizerId) {
    Message.error('当前账号没有可用的专家编号，无法提交讲座申请');
    return;
  }

  submitting.value = true;
  try {
    const draft = { ...form } as TeachingFormModel;
    const { objectivesText: _ignoreObjectivesText, ...rest } = draft;
    const payload: CreateTeachingLecturePayload = {
      ...(rest as Omit<TeachingFormModel, 'objectivesText'>),
      plannedAt: form.plannedAt ? toIsoString(form.plannedAt) : undefined,
      lecturer: { ...form.lecturer }
    };
    await createTeachingLecture(payload);
    Message.success('讲座申请已提交，等待管理员审核');
    router.push({ name: 'DoctorTeachingList' });
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.back();
}
</script>

<style scoped lang="less">
.lecture-create-page {
  padding-bottom: 32px;
  width: 100%;
  max-width: 100vw;

  .page-header {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
  }

  .create-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .create-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .create-layout.scrollable {
    flex: 1;
    overflow-y: auto;
    max-height: var(--teaching-scroll-height);
    padding-right: 8px;

    > * {
      width: 100%;
    }
  }

  .create-layout.scrollable::-webkit-scrollbar {
    width: 6px;
  }

  .create-layout.scrollable::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .section-card {
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .card-grid .full-width {
    grid-column: 1 / -1;
  }

  .visibility-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;

    :deep(.arco-radio) {
      align-items: flex-start;
    }
  }

  .visibility-option {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__title {
      font-weight: 600;
      font-size: 14px;
      color: #0f172a;
    }

    &__desc {
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }

    &__hint {
      display: inline-block;
      margin-left: 8px;
      color: #0ea5e9;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding: 8px 4px 0;
  }
}
</style>
