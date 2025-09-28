<template>
  <div class="referral-management">
    <div class="toolbar">
      <h3>{{ toolbarTitle }}</h3>
      <a-button
        v-if="canCreateReferral"
        type="primary"
        size="small"
        @click="openNewReferral"
        class="new-referral-btn"
      >{{ createReferralButtonLabel }}</a-button>
      <a-input v-model:value="q" placeholder="搜索患者/医院" style="width:280px" />
      <a-select v-model:value="status" size="small" style="width:160px; margin-left:8px">
        <a-option value="all">全部状态</a-option>
        <a-option value="pending">待处理</a-option>
        <a-option value="accepted">已接收（待反馈）</a-option>
        <a-option value="outpatient-completed">门诊反馈完成</a-option>
        <a-option value="inpatient-completed">住院反馈完成</a-option>
        <a-option value="followed-up">社区随访完成</a-option>
        <a-option value="rejected">已拒绝</a-option>
      </a-select>
      <a-select v-model:value="direction" size="small" style="width:160px" :disabled="directionLocked">
        <a-option value="all">全部方向</a-option>
        <a-option value="outbound">上转（社区 → 专科）</a-option>
        <a-option value="inbound">下转（专科 → 社区）</a-option>
      </a-select>
      <a-select v-model:value="transferType" size="small" style="width:160px">
        <a-option value="all">全部类型</a-option>
        <a-option value="outpatient">门诊</a-option>
        <a-option value="inpatient">住院</a-option>
      </a-select>
      <a-space style="margin-left:auto">
        <a-button type="text" size="small" @click="reset">重置</a-button>
        <a-button type="primary" size="small" @click="load">刷新</a-button>
      </a-space>
    </div>

    <div class="list">
  <ReferralCard
    v-for="r in list"
    :key="r.id"
    :referral="r"
    :showActions="showReferralActions"
    @open="openDetail"
    @accept="handleAccept"
    @reject="handleReject"
  />
    </div>

    <div class="pager" style="margin-top:12px; display:flex; gap:8px; align-items:center">
      <a-button size="small" :disabled="page<=1" @click="prev">上一页</a-button>
      <div>第 {{ page }} 页 / 共 {{ totalPages }} 页</div>
      <a-button size="small" :disabled="page>=totalPages" @click="next">下一页</a-button>
    </div>

    <a-drawer
      v-model:visible="drawerVisible"
      width="720"
      placement="right"
      unmount-on-close
      :footer="false"
    >
      <template #title>
        <div class="drawer-title" v-if="currentReferral">
          <div class="drawer-title-main">{{ currentReferral.patientName }} · {{ currentReferral.toHospital }}</div>
          <div class="drawer-title-sub">当前状态：{{ statusText(currentReferral.status) }}</div>
        </div>
        <span v-else>转诊详情</span>
      </template>
      <div v-if="currentReferral" class="drawer-body">
        <a-tabs v-model:active-key="drawerTab" type="capsule" size="small">
          <a-tab-pane key="overview" title="申请信息">
            <div class="tab-scroll">
              <div class="drawer-section">
              <div class="info-grid">
                <div class="info-item">
                  <label>患者</label>
                  <span>{{ currentPatient ? currentPatient.name : currentReferral.patientName }}</span>
                </div>
                <div class="info-item">
                  <label>患者ID</label>
                  <span>{{ currentReferral.patientId }}</span>
                </div>
                <div class="info-item">
                  <label>发起人</label>
                  <span>{{ submitterLabel }}</span>
                </div>
                <div class="info-item">
                  <label>转诊方向</label>
                  <span>{{ currentReferral.direction === 'outbound' ? '上转' : '下转' }}</span>
                </div>
                <div class="info-item">
                  <label>转诊类型</label>
                  <span>{{ currentReferral.transferType === 'outpatient' ? '门诊' : '住院' }}</span>
                </div>
                <div class="info-item">
                  <label>来源医院</label>
                  <span>{{ currentReferral.fromHospital }}</span>
                </div>
                <div class="info-item">
                  <label>目标医院</label>
                  <span>{{ currentReferral.toHospital }}</span>
                </div>
                <div class="info-item">
                  <label>创建时间</label>
                  <span>{{ formatDate(currentReferral.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <label>最新处理</label>
                  <span>{{ formatDate(currentReferral.updatedAt) }}</span>
                </div>
              </div>

              <template v-if="currentReferral.tags?.length">
                <div class="section-block">
                  <label>病历标签</label>
                  <div class="tag-list">
                    <a-tag v-for="tag in currentReferral.tags" :key="tag" type="primary" size="small">#{{ tag }}</a-tag>
                  </div>
                </div>
              </template>
              <template v-if="currentReferral.attentionNotes?.length">
                <div class="section-block">
                  <label>注意事项</label>
                  <ul>
                    <li v-for="(note, index) in currentReferral.attentionNotes" :key="index">{{ note }}</li>
                  </ul>
                </div>
              </template>
              <template v-if="currentReferral.note">
                <div class="section-block">
                  <label>原始摘要</label>
                  <p class="plain-block">{{ currentReferral.note }}</p>
                </div>
              </template>
              <template v-if="currentReferral.attachments?.length">
                <div class="section-block">
                  <label>附件</label>
                  <div class="tag-list attachment">
                    <a-tag v-for="file in currentReferral.attachments" :key="file" class="attachment-tag">{{ file }}</a-tag>
                  </div>
                </div>
              </template>
              <template v-if="currentReferral.informedPatient">
                <div class="section-block">
                  <label>患者交接说明</label>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>交接联系人</label>
                      <span>{{ currentReferral.informedPatient.doctorName || '社区责任医生' }}</span>
                    </div>
                    <div class="info-item">
                      <label>确认时间</label>
                      <span>{{ formatDate(currentReferral.informedPatient.confirmedAt) }}</span>
                    </div>
                  </div>
                  <p class="plain-block" v-if="currentReferral.informedPatient.notes">
                    {{ currentReferral.informedPatient.notes }}
                  </p>
                  <p class="plain-block" v-else>暂无补充说明</p>
                </div>
              </template>
              <template v-if="currentReferral.downReferral">
                <div class="section-block">
                  <label>下转交接</label>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>提交时间</label>
                      <span>{{ formatDate(currentReferral.downReferral.submittedAt) }}</span>
                    </div>
                    <div class="info-item">
                      <label>提交医生</label>
                      <span>{{ currentReferral.downReferral.doctorName }}</span>
                    </div>
                    <div class="info-item">
                      <label>下转类型</label>
                      <span>{{ currentReferral.downReferral.type === 'outpatient' ? '门诊' : '住院' }}</span>
                    </div>
                  </div>
                  <div class="plain-block">
                    <strong>诊疗总结：</strong>{{ currentReferral.downReferral.diagnosisOrSummary }}
                  </div>
                  <div class="plain-block">
                    <strong>治疗方案：</strong>{{ currentReferral.downReferral.treatmentPlan }}
                  </div>
                  <div class="plain-block">
                    <strong>继续医嘱：</strong>{{ currentReferral.downReferral.advice }}
                  </div>
                  <div class="tag-list attachment" v-if="currentReferral.downReferral.attachments?.length">
                    <a-tag
                      v-for="attachment in currentReferral.downReferral.attachments"
                      :key="attachment"
                      class="attachment-tag"
                    >{{ attachment }}</a-tag>
                  </div>
                </div>
              </template>
              <template v-if="followUpHistory.length">
                <div class="section-block">
                  <label>社区随访记录</label>
                  <ul>
                    <li v-for="(record, idx) in followUpHistory" :key="record.visitedAt + idx">
                      <strong>{{ formatDate(record.visitedAt) }}</strong> · {{ record.doctorName || '社区医生' }}
                      <span class="muted" style="display:block; margin-top:4px">{{ record.remarks }}</span>
                    </li>
                  </ul>
                </div>
              </template>
            </div>

            <div class="drawer-section" v-if="timelineItems.length">
              <label class="section-header">流程节点</label>
              <a-timeline
                mode="left"
                style="max-height: 280px; overflow: auto; padding-right: 8px"
              >
                <a-timeline-item
                  v-for="(item, index) in timelineItems"
                  :key="index"
                  :label="formatDate(item.at)"
                  :color="timelineColor(item.step)"
                >
                  <div class="timeline-item">
                    <div class="timeline-step">{{ auditStepLabel(item.step) }}</div>
                    <div class="timeline-meta">
                      <span>{{ item.by }}</span>
                      <span v-if="item.note" class="muted">{{ item.note }}</span>
                    </div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
            </div>
          </a-tab-pane>

          <a-tab-pane key="approve" title="审核处理" v-if="canApprove">
            <div class="tab-scroll">
              <div class="drawer-section">
                <p class="section-tip">请审核社区医生提交的转诊申请，可选择接收或退回</p>
                <a-textarea
                  v-model:value="noteText"
                  :auto-size="{ minRows: 3, maxRows: 6 }"
                  placeholder="记录审核说明或退回原因（选填）"
                />
                <div class="action-row">
                  <a-space>
                    <a-button @click="closeDrawer">取消</a-button>
                    <a-button
                      type="primary"
                      status="success"
                      :loading="approvingAction === 'accept'"
                      @click="confirmApproval('accept')"
                    >
                      确认接收
                    </a-button>
                    <a-button
                      status="danger"
                      :loading="approvingAction === 'reject'"
                      @click="confirmApproval('reject')"
                    >
                      退回申请
                    </a-button>
                  </a-space>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <a-tab-pane key="feedback" title="诊疗反馈" v-if="showFeedbackTab">
            <div class="drawer-section" v-if="currentReferral.transferType === 'outpatient'">
              <div class="section-head">
                <span>门诊反馈</span>
                <a-tag v-if="currentReferral.treatmentPlan" size="small" type="primary">已填写</a-tag>
              </div>
              <a-alert
                v-if="!canSubmitOutpatient"
                type="info"
                show-icon
                style="margin-bottom: 12px"
                message="门诊反馈仅在已接收状态下可提交"
              />
              <a-form :model="outpatientForm" layout="vertical">
                <a-form-item label="诊断" required>
                  <a-input v-model="outpatientForm.diagnosis" placeholder="如：2 型糖尿病伴外周神经病变" />
                </a-form-item>
                <a-form-item label="治疗方案" required>
                  <a-textarea v-model="outpatientForm.treatment" :auto-size="{ minRows: 2, maxRows: 5 }" />
                </a-form-item>
                <a-form-item label="医嘱与随诊建议" required>
                  <a-textarea v-model="outpatientForm.advice" :auto-size="{ minRows: 2, maxRows: 4 }" />
                </a-form-item>
                <a-form-item label="诊疗附件（逗号分隔）">
                  <a-input v-model="outpatientForm.attachmentsText" placeholder="plan-20250912.pdf, lab-result.png" />
                </a-form-item>
              </a-form>
              <div class="action-row">
                <a-button
                  type="primary"
                  :loading="submittingOutpatient"
                  :disabled="!canSubmitOutpatient"
                  @click="submitOutpatientFeedback"
                >提交门诊反馈</a-button>
              </div>
            </div>

            <div class="drawer-section" v-else>
              <div class="section-head">
                <span>住院反馈</span>
                <a-tag v-if="currentReferral.inpatientReport" size="small" type="primary">已填写</a-tag>
              </div>
              <a-alert
                v-if="!canSubmitInpatient"
                type="info"
                show-icon
                style="margin-bottom: 12px"
                message="住院反馈仅在已接收状态下可提交"
              />
              <a-form :model="inpatientForm" layout="vertical">
                <div class="form-row">
                  <a-form-item label="入院日期" required>
                    <a-date-picker v-model="inpatientForm.admissionDate" style="width: 100%" />
                  </a-form-item>
                  <a-form-item label="出院日期">
                    <a-date-picker v-model="inpatientForm.dischargeDate" style="width: 100%" />
                  </a-form-item>
                </div>
                <a-form-item label="住院概况" required>
                  <a-textarea v-model="inpatientForm.summary" :auto-size="{ minRows: 3, maxRows: 6 }" />
                </a-form-item>
                <a-form-item label="随访建议" required>
                  <a-textarea v-model="inpatientForm.advice" :auto-size="{ minRows: 2, maxRows: 5 }" />
                </a-form-item>
                <a-form-item label="出院材料（逗号分隔）">
                  <a-input v-model="inpatientForm.attachmentsText" placeholder="discharge-summary.pdf" />
                </a-form-item>
              </a-form>
              <div class="action-row">
                <a-button
                  type="primary"
                  :loading="submittingInpatient"
                  :disabled="!canSubmitInpatient"
                  @click="submitInpatientFeedback"
                >提交住院反馈</a-button>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="community" title="社区操作" v-if="showCommunityTab">
            <div class="drawer-section">
              <div class="section-head">
                <span>患者交接说明</span>
                <a-tag v-if="hasInstruction" size="small" type="success">已记录</a-tag>
              </div>
              <p class="section-tip">向患者及家属交代转诊流程要点，并记录重点提醒，方便专科医生快速了解准备情况。</p>
              <template v-if="hasInstruction">
                <a-alert type="success" show-icon message="已完成交接说明记录，可在申请信息中查看详情" />
                <p class="plain-block" style="margin-top:12px">
                  {{ currentReferral?.informedPatient?.notes || '暂无补充说明' }}
                </p>
              </template>
              <template v-else>
                <a-textarea
                  v-model="instructionForm.notes"
                  :auto-size="{ minRows: 3, maxRows: 5 }"
                  placeholder="例如：携带既往影像资料、提前一小时到院办理手续、注意空腹等"
                />
                <div class="action-row">
                  <a-button
                    type="primary"
                    :loading="submittingInstruction"
                    @click="submitPatientInstruction"
                  >提交交接说明</a-button>
                </div>
              </template>
            </div>
            <div class="drawer-section">
              <div class="section-head">
                <span>社区随访</span>
                <a-tag v-if="followUpHistory.length" size="small" type="primary">已有 {{ followUpHistory.length }} 次</a-tag>
              </div>
              <template v-if="canRecordFollowUp">
                <a-form :model="followUpForm" layout="vertical">
                  <a-form-item label="随访时间" required>
                    <a-date-picker
                      v-model="followUpForm.visitedAt"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DDTHH:mm"
                      style="width: 100%"
                    />
                  </a-form-item>
                  <a-form-item label="随访记录" required>
                    <a-textarea
                      v-model="followUpForm.remarks"
                      :auto-size="{ minRows: 3, maxRows: 5 }"
                      placeholder="记录患者恢复情况、用药依从性等"
                    />
                  </a-form-item>
                </a-form>
                <div class="action-row">
                  <a-button
                    type="primary"
                    :loading="submittingFollowUp"
                    @click="submitFollowUpRecord"
                  >提交随访</a-button>
                </div>
              </template>
              <template v-else>
                <a-alert
                  type="info"
                  show-icon
                  message="等待专科医院完成诊疗并提交下转单后，方可开展社区随访。"
                />
              </template>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <a-empty v-else description="请选择一条转诊记录" />
    </a-drawer>

    <a-modal
      v-model:visible="newReferralVisible"
      :footer="false"
      :mask-closable="false"
      title="新建双向转诊"
    >
      <a-form :model="newReferralForm" layout="vertical">
        <a-form-item label="选择患者" required>
          <a-select
            v-model="newReferralForm.patientId"
            placeholder="请选择患者"
            :options="patientSelectOptions"
            :loading="loadingPatients"
            allow-search
            :fallback-option="false"
          />
        </a-form-item>

        <a-form-item label="转诊方向" required>
          <a-radio-group v-model="newReferralForm.direction" type="button">
            <a-radio value="outbound">上转（社区 → 专科）</a-radio>
            <a-radio value="inbound" :disabled="isCommunityDoctor">下转（专科 → 社区）</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="转诊类型" required>
          <a-radio-group v-model="newReferralForm.transferType" type="button">
            <a-radio value="outpatient">门诊</a-radio>
            <a-radio value="inpatient">住院</a-radio>
          </a-radio-group>
        </a-form-item>

        <div class="form-row">
          <a-form-item label="来源医疗机构" required>
            <a-input v-model="newReferralForm.fromHospital" placeholder="如：朝阳社区卫生服务中心" />
          </a-form-item>
          <a-form-item label="目标医疗机构" required>
            <a-input v-model="newReferralForm.toHospital" placeholder="如：北京协和医院内分泌科" />
          </a-form-item>
        </div>

        <a-form-item label="标签（逗号分隔，可选）">
          <a-input v-model="newReferralForm.tagsText" placeholder="糖尿病, 随访提醒" />
        </a-form-item>

        <a-form-item label="注意事项（换行分隔，可选）">
          <a-textarea
            v-model="newReferralForm.attentionText"
            :auto-size="{ minRows: 2, maxRows: 4 }"
            placeholder="空腹前往门诊\n携带既往病例"
          />
        </a-form-item>

        <a-form-item label="转诊摘要" required>
          <a-textarea
            v-model="newReferralForm.note"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            placeholder="请描述患者目前病情与转诊目的"
          />
        </a-form-item>

        <a-space style="width: 100%; justify-content: flex-end">
          <a-button @click="cancelNewReferral" :disabled="submittingReferral">取消</a-button>
          <a-button type="primary" @click="submitNewReferral" :loading="submittingReferral">提交转诊</a-button>
        </a-space>
      </a-form>
    </a-modal>

    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import ReferralCard from '@/components/ReferralCard.vue';
import {
  fetchReferrals,
  updateReferralStatus,
  fetchReferralById,
  createReferral,
  attachTreatmentReport,
  recordPatientInstruction,
  recordFollowUp
} from '@/api/mock/referrals';
import type { ReferralCase, ReferralStatus, ReferralAuditItem } from '@/api/mock/referrals';
import { fetchPatientById, fetchPatients } from '@/api/mock/patients';
import type { PatientSummary } from '@/api/mock/patients';
import { Message } from '@arco-design/web-vue';
import { useDoctorRole, type DoctorRole } from '@/utils/doctorRole';

const COMMUNITY_HOSPITAL_NAME = '朝阳社区卫生服务中心';
const SPECIALIST_HOSPITAL_NAME = '北京协和医院内分泌科';
const HOSPITAL_DOCTOR = { id: 'doctor.he001', name: '郭毅' };
const COMMUNITY_DOCTOR = { id: 'doctor.community01', name: '李责任' };
const defaultHospitalsByDirection = {
  outbound: { from: COMMUNITY_HOSPITAL_NAME, to: SPECIALIST_HOSPITAL_NAME },
  inbound: { from: SPECIALIST_HOSPITAL_NAME, to: COMMUNITY_HOSPITAL_NAME }
} as const;
const defaultSubmitterByDirection = {
  outbound: { ...COMMUNITY_DOCTOR, role: 'community-doctor' as const },
  inbound: { ...HOSPITAL_DOCTOR, role: 'hospital-doctor' as const }
} as const;
type ReferralDirection = keyof typeof defaultHospitalsByDirection;
type ReferralTransferType = 'outpatient' | 'inpatient';

const { role: doctorRole, isCommunityDoctor } = useDoctorRole();

const defaultDirectionForRole = (role: DoctorRole): ReferralDirection =>
  role === 'community' ? 'outbound' : 'inbound';

const defaultFilterDirectionForRole = (role: DoctorRole): 'all' | ReferralDirection =>
  role === 'community' ? 'outbound' : 'all';

const nowInputDateTime = () => new Date().toISOString().slice(0, 16);

const list = ref<ReferralCase[]>([]);
const page = ref(1);
const pageSize = ref(5);
const total = ref(0);
const q = ref('');
const status = ref<ReferralStatus | 'all'>('all');
const direction = ref<'all' | 'inbound' | 'outbound'>(defaultFilterDirectionForRole(doctorRole.value));
const transferType = ref<'all' | 'outpatient' | 'inpatient'>('all');
const drawerVisible = ref(false);
const currentReferral = ref<ReferralCase | null>(null);
const currentPatient = ref<PatientSummary | null>(null);
const noteText = ref('');
const newReferralVisible = ref(false);
const submittingReferral = ref(false);
const loadingPatients = ref(false);
const patientOptions = ref<PatientSummary[]>([]);
const drawerTab = ref<'overview' | 'approve' | 'feedback' | 'community'>('overview');
const approvingAction = ref<'accept' | 'reject' | null>(null);
const submittingOutpatient = ref(false);
const submittingInpatient = ref(false);
const submittingInstruction = ref(false);
const submittingFollowUp = ref(false);
interface NewReferralFormState {
  patientId: string;
  direction: ReferralDirection;
  transferType: ReferralTransferType;
  fromHospital: string;
  toHospital: string;
  tagsText: string;
  attentionText: string;
  note: string;
}

interface OutpatientFormState {
  diagnosis: string;
  treatment: string;
  advice: string;
  attachmentsText: string;
}

interface InpatientFormState {
  admissionDate: string;
  dischargeDate: string;
  summary: string;
  advice: string;
  attachmentsText: string;
}

interface InstructionFormState {
  notes: string;
}

interface FollowUpFormState {
  visitedAt: string;
  remarks: string;
}

const newReferralForm = reactive<NewReferralFormState>({
  patientId: '',
  direction: 'outbound',
  transferType: 'outpatient',
  fromHospital: defaultHospitalsByDirection.outbound.from,
  toHospital: defaultHospitalsByDirection.outbound.to,
  tagsText: '',
  attentionText: '',
  note: ''
});
const outpatientForm = reactive<OutpatientFormState>({
  diagnosis: '',
  treatment: '',
  advice: '',
  attachmentsText: ''
});
const inpatientForm = reactive<InpatientFormState>({
  admissionDate: '',
  dischargeDate: '',
  summary: '',
  advice: '',
  attachmentsText: ''
});
const instructionForm = reactive<InstructionFormState>({
  notes: ''
});
const followUpForm = reactive<FollowUpFormState>({
  visitedAt: nowInputDateTime(),
  remarks: ''
});
const patientSelectOptions = computed(() =>
  patientOptions.value.map((p) => ({
    label: `${p.name}${p.phone ? `（${p.phone}）` : ''}`,
    value: p.id
  }))
);

const toolbarTitle = computed(() => (isCommunityDoctor.value ? '社区转诊发起箱' : '专科接诊管理'));
const createReferralButtonLabel = computed(() => (isCommunityDoctor.value ? '新建上转单' : '新建转诊'));
const directionLocked = computed(() => isCommunityDoctor.value);
const canCreateReferral = computed(() => isCommunityDoctor.value);
const showReferralActions = computed(() => !isCommunityDoctor.value);

const statusTextMap: Record<ReferralStatus, string> = {
  pending: '待处理',
  accepted: '已接收',
  'outpatient-completed': '门诊反馈完成',
  'inpatient-completed': '住院反馈完成',
  'followed-up': '社区随访完成',
  rejected: '已拒绝'
};

const auditLabels: Record<ReferralAuditItem['step'], string> = {
  submitted: '发起申请',
  'patient-informed': '交接说明完成',
  accepted: '专科已接收',
  rejected: '专科拒绝',
  'outpatient-completed': '门诊诊疗完成',
  'inpatient-completed': '住院诊疗完成',
  'down-referral-submitted': '下转单提交',
  'followed-up': '社区随访完成',
  note: '备注更新'
};

const timelineColors: Record<ReferralAuditItem['step'], string> = {
  submitted: '#0b5fff',
  'patient-informed': '#f97316',
  accepted: '#21c29b',
  rejected: '#ff7d6b',
  'outpatient-completed': '#4ade80',
  'inpatient-completed': '#38bdf8',
  'down-referral-submitted': '#facc15',
  'followed-up': '#818cf8',
  note: '#94a3b8'
};

const timelineItems = computed<ReferralAuditItem[]>(() => {
  if (!currentReferral.value?.auditTrail) return [];
  return [...currentReferral.value.auditTrail].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
});

const submitterLabel = computed(() => {
  if (!currentReferral.value) return '';
  if (currentReferral.value.submittedByName) return currentReferral.value.submittedByName;
  if (currentReferral.value.submittedById) return currentReferral.value.submittedById;
  return currentReferral.value.direction === 'outbound' ? '社区医生' : '专科医生';
});

const canApprove = computed(() => !isCommunityDoctor.value && currentReferral.value?.status === 'pending');
const showFeedbackTab = computed(() => {
  if (!currentReferral.value || isCommunityDoctor.value) return false;
  return currentReferral.value.status !== 'rejected';
});
const canSubmitOutpatient = computed(() => {
  if (!currentReferral.value) return false;
  if (currentReferral.value.transferType !== 'outpatient') return false;
  if (isCommunityDoctor.value) return false;
  return ['accepted', 'outpatient-completed'].includes(currentReferral.value.status);
});
const canSubmitInpatient = computed(() => {
  if (!currentReferral.value) return false;
  if (currentReferral.value.transferType !== 'inpatient') return false;
  if (isCommunityDoctor.value) return false;
  return ['accepted', 'inpatient-completed'].includes(currentReferral.value.status);
});
const hasInstruction = computed(() => Boolean(currentReferral.value?.informedPatient));
const showCommunityTab = computed(() => {
  if (!isCommunityDoctor.value) return false;
  if (!currentReferral.value) return false;
  return currentReferral.value.direction === 'outbound';
});
const canRecordInstruction = computed(() => showCommunityTab.value && !hasInstruction.value);
const canRecordFollowUp = computed(() => {
  if (!showCommunityTab.value || !currentReferral.value) return false;
  return ['outpatient-completed', 'inpatient-completed', 'followed-up'].includes(currentReferral.value.status);
});
const followUpHistory = computed(() => {
  if (!currentReferral.value?.followUps?.length) return [] as NonNullable<ReferralCase['followUps']>;
  return [...currentReferral.value.followUps].sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime());
});

function statusText(status: ReferralStatus) {
  return statusTextMap[status] ?? status;
}

function auditStepLabel(step: ReferralAuditItem['step']) {
  return auditLabels[step] ?? step;
}

function timelineColor(step: ReferralAuditItem['step']) {
  return timelineColors[step] ?? '#0b5fff';
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

function resetOutpatientForm(data?: ReferralCase['treatmentPlan']) {
  outpatientForm.diagnosis = data?.diagnosis ?? '';
  outpatientForm.treatment = data?.treatment ?? '';
  outpatientForm.advice = data?.advice ?? '';
  outpatientForm.attachmentsText = data?.attachments?.join(', ') ?? '';
}

function resetInpatientForm(data?: ReferralCase['inpatientReport']) {
  inpatientForm.admissionDate = data?.admissionDate ?? '';
  inpatientForm.dischargeDate = data?.dischargeDate ?? '';
  inpatientForm.summary = data?.summary ?? '';
  inpatientForm.advice = data?.advice ?? '';
  inpatientForm.attachmentsText = data?.attachments?.join(', ') ?? '';
}

function resetInstructionForm(data?: ReferralCase['informedPatient']) {
  instructionForm.notes = data?.notes ?? '';
}

function resetFollowUpForm() {
  followUpForm.visitedAt = nowInputDateTime();
  followUpForm.remarks = '';
}

async function reloadCurrentReferral() {
  if (!currentReferral.value) return;
  const latest = await fetchReferralById(currentReferral.value.id);
  if (!latest) {
    Message.warning('当前转诊记录已不存在');
    closeDrawer();
    await load();
    return;
  }
  currentReferral.value = latest;
  if (latest.patientId) {
    currentPatient.value = await fetchPatientById(latest.patientId);
  } else {
    currentPatient.value = null;
  }
}

async function submitOutpatientFeedback() {
  if (isCommunityDoctor.value) {
    Message.warning('社区医生无需提交门诊反馈');
    return;
  }
  if (!currentReferral.value) return;
  if (!outpatientForm.diagnosis.trim() || !outpatientForm.treatment.trim() || !outpatientForm.advice.trim()) {
    Message.warning('请完善门诊反馈的必填信息');
    return;
  }
  submittingOutpatient.value = true;
  try {
    const attachments = outpatientForm.attachmentsText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    await attachTreatmentReport(currentReferral.value.id, {
      type: 'outpatient',
      payload: {
        diagnosis: outpatientForm.diagnosis.trim(),
        treatment: outpatientForm.treatment.trim(),
        advice: outpatientForm.advice.trim(),
        attachments,
        completedAt: new Date().toISOString()
      },
      handledBy: HOSPITAL_DOCTOR.name
    });
    Message.success('已提交门诊反馈');
    await reloadCurrentReferral();
    await load();
    drawerTab.value = 'overview';
  } catch (error) {
    console.error(error);
    Message.error('提交门诊反馈失败，请稍后再试');
  } finally {
    submittingOutpatient.value = false;
  }
}

async function submitInpatientFeedback() {
  if (isCommunityDoctor.value) {
    Message.warning('社区医生无需提交住院反馈');
    return;
  }
  if (!currentReferral.value) return;
  if (!inpatientForm.admissionDate) {
    Message.warning('请填写入院日期');
    return;
  }
  if (!inpatientForm.summary.trim() || !inpatientForm.advice.trim()) {
    Message.warning('请完善住院反馈的必填信息');
    return;
  }
  submittingInpatient.value = true;
  try {
    const attachments = inpatientForm.attachmentsText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    await attachTreatmentReport(currentReferral.value.id, {
      type: 'inpatient',
      payload: {
        admissionDate: inpatientForm.admissionDate,
        dischargeDate: inpatientForm.dischargeDate || undefined,
        summary: inpatientForm.summary.trim(),
        advice: inpatientForm.advice.trim(),
        attachments
      },
      handledBy: HOSPITAL_DOCTOR.name
    });
    Message.success('已提交住院反馈');
    await reloadCurrentReferral();
    await load();
    drawerTab.value = 'overview';
  } catch (error) {
    console.error(error);
    Message.error('提交住院反馈失败，请稍后再试');
  } finally {
    submittingInpatient.value = false;
  }
}

async function submitPatientInstruction() {
  if (!isCommunityDoctor.value) {
  Message.warning('仅社区责任医生需记录交接说明');
    return;
  }
  if (!currentReferral.value) return;
  if (!canRecordInstruction.value) {
  Message.info('该转诊已完成交接说明');
    return;
  }
  if (!instructionForm.notes.trim()) {
  Message.warning('请填写交接说明内容');
    return;
  }
  submittingInstruction.value = true;
  try {
    const timestamp = new Date().toISOString();
    await recordPatientInstruction(currentReferral.value.id, {
      confirmedAt: timestamp,
      notes: instructionForm.notes.trim(),
      doctorId: COMMUNITY_DOCTOR.id,
      doctorName: COMMUNITY_DOCTOR.name
    });
  Message.success('已记录交接说明');
    resetInstructionForm();
    await reloadCurrentReferral();
    await load();
  } catch (error) {
    console.error(error);
  Message.error('提交交接说明失败，请稍后再试');
  } finally {
    submittingInstruction.value = false;
  }
}

async function submitFollowUpRecord() {
  if (!isCommunityDoctor.value) {
    Message.warning('仅社区医生需要执行随访');
    return;
  }
  if (!currentReferral.value) return;
  if (!canRecordFollowUp.value) {
    Message.info('当前转诊尚未进入随访阶段');
    return;
  }
  if (!followUpForm.remarks.trim()) {
    Message.warning('请填写随访记录');
    return;
  }
  submittingFollowUp.value = true;
  try {
    const isoVisitedAt = followUpForm.visitedAt
      ? new Date(followUpForm.visitedAt).toISOString()
      : new Date().toISOString();
    await recordFollowUp(currentReferral.value.id, {
      visitedAt: isoVisitedAt,
      remarks: followUpForm.remarks.trim(),
      doctorId: COMMUNITY_DOCTOR.id,
      doctorName: COMMUNITY_DOCTOR.name
    });
    Message.success('已提交社区随访记录');
    resetFollowUpForm();
    await reloadCurrentReferral();
    await load();
  } catch (error) {
    console.error(error);
    Message.error('提交随访记录失败，请稍后再试');
  } finally {
    submittingFollowUp.value = false;
  }
}

function applyDirectionDefaults(direction: ReferralDirection) {
  const defaults = defaultHospitalsByDirection[direction];
  newReferralForm.fromHospital = defaults.from;
  newReferralForm.toHospital = defaults.to;
}

async function load() {
  const res = await fetchReferrals({
    page: page.value,
    pageSize: pageSize.value,
    q: q.value,
    status: status.value === 'all' ? undefined : status.value,
    direction: direction.value === 'all' ? undefined : direction.value,
    transferType: transferType.value === 'all' ? undefined : transferType.value
  });
  list.value = res.items;
  total.value = res.total;
}

function reset() {
  q.value = '';
  status.value = 'all';
  direction.value = defaultFilterDirectionForRole(doctorRole.value);
  transferType.value = 'all';
  page.value = 1;
  load();
}

async function openDetail(id: string, options: { tab?: 'overview' | 'approve' | 'feedback' } = {}) {
  const ref = list.value.find(r => r.id === id) || null;
  currentReferral.value = ref ?? (await fetchReferralById(id));
  if (currentReferral.value && currentReferral.value.patientId) {
    currentPatient.value = await fetchPatientById(currentReferral.value.patientId);
  } else {
    currentPatient.value = null;
  }
  if (!currentReferral.value) {
    Message.warning('未找到该转诊记录');
    return;
  }
  drawerVisible.value = true;
  const defaultTab = options.tab ?? (isCommunityDoctor.value ? 'community' : 'overview');
  drawerTab.value = defaultTab;
  noteText.value = '';
  approvingAction.value = null;
}

async function handleAccept(id: string) {
  await openDetail(id, { tab: 'approve' });
}

async function handleReject(id: string) {
  await openDetail(id, { tab: 'approve' });
}

function closeDrawer() {
  drawerVisible.value = false;
  drawerTab.value = 'overview';
  approvingAction.value = null;
  noteText.value = '';
  currentReferral.value = null;
  currentPatient.value = null;
  resetInstructionForm();
  resetFollowUpForm();
}

async function confirmApproval(action: 'accept' | 'reject') {
  if (isCommunityDoctor.value) {
    Message.warning('社区医生无审批权限');
    return;
  }
  if (!currentReferral.value) return;
  if (action === 'accept' && !canApprove.value && currentReferral.value.status !== 'accepted') {
    Message.warning('当前状态无需再次接收');
    return;
  }
  approvingAction.value = action;
  try {
    const statusToSet: ReferralStatus = action === 'accept' ? 'accepted' : 'rejected';
  await updateReferralStatus(currentReferral.value.id, statusToSet, noteText.value || undefined, HOSPITAL_DOCTOR.name);
    Message.success(action === 'accept' ? '已接收转诊请求' : '已退回该转诊');
    await reloadCurrentReferral();
    await load();
    if (action === 'reject') {
      closeDrawer();
    } else if (showFeedbackTab.value) {
      drawerTab.value = 'feedback';
    } else {
      drawerTab.value = 'overview';
    }
  } catch (error) {
    console.error(error);
    Message.error('操作失败，请稍后再试');
  } finally {
    approvingAction.value = null;
  }
}

function resetNewReferralForm() {
  newReferralForm.patientId = '';
  newReferralForm.direction = 'outbound';
  newReferralForm.transferType = 'outpatient';
  applyDirectionDefaults('outbound');
  newReferralForm.tagsText = '';
  newReferralForm.attentionText = '';
  newReferralForm.note = '';
}

async function openNewReferral() {
  if (!canCreateReferral.value) {
    Message.info('当前角色无需新建上转单');
    return;
  }
  newReferralVisible.value = true;
  newReferralForm.direction = defaultDirectionForRole(doctorRole.value);
  applyDirectionDefaults(newReferralForm.direction);
  if (!patientOptions.value.length) {
    loadingPatients.value = true;
    try {
      patientOptions.value = await fetchPatients();
    } catch (error) {
      console.error(error);
      Message.error('加载患者列表失败');
    } finally {
      loadingPatients.value = false;
    }
  }
  if (!newReferralForm.patientId && patientOptions.value.length) {
    const firstPatient = patientOptions.value[0];
    if (firstPatient) {
      newReferralForm.patientId = firstPatient.id;
    }
  }
}

function cancelNewReferral() {
  resetNewReferralForm();
  newReferralVisible.value = false;
}

async function submitNewReferral() {
  if (submittingReferral.value) return;
  if (!newReferralForm.patientId) {
    Message.warning('请选择患者');
    return;
  }
  if (!newReferralForm.fromHospital.trim() || !newReferralForm.toHospital.trim()) {
    Message.warning('请完善来源与目标医疗机构');
    return;
  }
  if (!newReferralForm.note.trim()) {
    Message.warning('请填写转诊摘要');
    return;
  }
  submittingReferral.value = true;
  try {
    const patient = patientOptions.value.find(p => p.id === newReferralForm.patientId);
    const submitter = defaultSubmitterByDirection[newReferralForm.direction];
    await createReferral({
      patientId: newReferralForm.patientId,
      patientName: patient?.name || '未知患者',
      direction: newReferralForm.direction,
      transferType: newReferralForm.transferType,
      fromHospital: newReferralForm.fromHospital.trim(),
      toHospital: newReferralForm.toHospital.trim(),
      tags: newReferralForm.tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      attentionNotes: newReferralForm.attentionText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0),
      note: newReferralForm.note.trim(),
      submittedById: submitter.id,
      submittedByName: submitter.name,
      submitterRole: submitter.role
    });
    Message.success('已创建转诊请求');
    cancelNewReferral();
    page.value = 1;
    await load();
  } catch (error) {
    console.error(error);
    Message.error('创建转诊失败');
  } finally {
    submittingReferral.value = false;
  }
}

watch<ReferralDirection>(
  () => newReferralForm.direction,
  (dir, prev) => {
    const previousDirection = prev ?? 'outbound';
    const previous = defaultHospitalsByDirection[previousDirection];
    const shouldReset =
      (!newReferralForm.fromHospital || newReferralForm.fromHospital === previous.from) &&
      (!newReferralForm.toHospital || newReferralForm.toHospital === previous.to);
    if (shouldReset) {
      applyDirectionDefaults(dir);
    }
  }
);

watch(
  () => currentReferral.value,
  (value) => {
    if (!value) {
      resetOutpatientForm();
      resetInpatientForm();
      resetInstructionForm();
      resetFollowUpForm();
      noteText.value = '';
      return;
    }
    resetOutpatientForm(value.treatmentPlan);
    resetInpatientForm(value.inpatientReport);
    resetInstructionForm(value.informedPatient);
    resetFollowUpForm();
    if (!inpatientForm.admissionDate && value.transferType === 'inpatient') {
      inpatientForm.admissionDate = new Date().toISOString().slice(0, 10);
    }
    if (drawerTab.value === 'approve') {
      noteText.value = '';
    }
  }
);

watch(drawerVisible, (visible) => {
  if (visible) return;
  drawerTab.value = 'overview';
  approvingAction.value = null;
  noteText.value = '';
  currentReferral.value = null;
  currentPatient.value = null;
  resetInstructionForm();
  resetFollowUpForm();
});

// reference to avoid false-positive "declared but not used" diagnostics
void ReferralCard;
void openDetail;

onMounted(load);

watch([page, pageSize], () => { load(); });

watch(
  () => doctorRole.value,
  (role) => {
    direction.value = defaultFilterDirectionForRole(role);
    status.value = 'all';
    transferType.value = 'all';
    page.value = 1;
    newReferralForm.direction = defaultDirectionForRole(role);
    applyDirectionDefaults(newReferralForm.direction);
    load();
  }
);

watch([q, status, direction, transferType], () => {
  page.value = 1;
  load();
});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
function prev() { if (page.value > 1) page.value--; }
function next() { if (page.value < totalPages.value) page.value++; }
</script>

<style scoped>
.referral-management { padding:20px; background: linear-gradient(180deg,#f8fbff 0,#fff 100%); border-radius:8px }
.referral-management .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:12px }
.list { display:flex; flex-direction:column; gap:10px }
.drawer-title { display:flex; flex-direction:column; gap:4px }
.drawer-title-main { font-weight:600; font-size:16px; color:#111827 }
.drawer-title-sub { font-size:12px; color:#64748b }
.drawer-body { display:flex; flex-direction:column; gap:16px; max-height:100% }
.tab-scroll { max-height:65vh; overflow-y:auto; padding-right:8px; display:flex; flex-direction:column; gap:16px }
.drawer-section { background:rgba(248,250,252,0.6); border:1px solid rgba(15,23,42,0.05); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px }
.tab-scroll .drawer-section { margin:0 }
.info-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 16px }
.info-item label { display:block; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.02em; margin-bottom:4px }
.info-item span { color:#0f172a; font-weight:500 }
.section-block label { display:block; font-weight:600; color:#0f172a; margin-bottom:6px }
.section-block ul { margin:0; padding-left:18px; color:#475569; line-height:1.6 }
.tag-list { display:flex; flex-wrap:wrap; gap:8px }
.tag-list.attachment .attachment-tag { background:#eef2ff; color:#4338ca; border-color:transparent }
.plain-block { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; color:#1f2937; line-height:1.6 }
.section-header { font-weight:600; color:#1f2937; margin-bottom:8px; display:block }
.timeline-item { display:flex; flex-direction:column; gap:4px }
.timeline-step { font-weight:600; color:#0f172a }
.timeline-meta { font-size:12px; color:#6b7280; display:flex; flex-wrap:wrap; gap:6px }
.timeline-meta .muted { color:#94a3b8 }
.section-head { display:flex; align-items:center; gap:8px; font-weight:600; color:#0f172a }
.section-tip { color:#6b7280; font-size:13px }
.form-row { display:flex; gap:12px; flex-wrap:wrap }
.form-row > * { flex:1 1 180px }
.action-row { display:flex; justify-content:flex-end; margin-top:12px }
</style>
