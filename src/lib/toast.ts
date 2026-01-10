import { toast as sonnerToast, ExternalToast } from 'sonner';

type ToastOptions = ExternalToast;

export const toast = {
  success: (message: string, options?: ToastOptions) => sonnerToast.success(message, options),

  error: (message: string, options?: ToastOptions) => sonnerToast.error(message, options),

  warning: (message: string, options?: ToastOptions) => sonnerToast.warning(message, options),

  info: (message: string, options?: ToastOptions) => sonnerToast.info(message, options),

  loading: (message: string, options?: ToastOptions) => sonnerToast.loading(message, options),

  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => sonnerToast.promise(promise, messages),
};
