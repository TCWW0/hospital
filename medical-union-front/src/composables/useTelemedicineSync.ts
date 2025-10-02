import { onBeforeUnmount, onMounted } from 'vue';
import { subscribeToExternalChanges } from '@/api/mock/telemedicine.repository';

export function useTelemedicineSync(onExternalChange: () => void) {
  let unsubscribe: (() => void) | null = null;

  onMounted(() => {
    unsubscribe = subscribeToExternalChanges(onExternalChange);
  });

  onBeforeUnmount(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  });
}
