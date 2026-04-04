import { useCallback, useEffect, useMemo, useState } from "react";

export const CREDENTIALS_STORAGE_KEY = "reddix_credentials";

export type FormCred = {
	provider: "groq";
	endpoint: string;
	apiKey: string;
	model: string;
};

export const DEFAULT_FORM_CRED: FormCred = {
	provider: "groq",
	endpoint: "https://api.groq.com/openai/v1/chat/completions",
	apiKey: "",
	model: "llama-3.3-70b-versatile",
};

type UseFormResult = {
	formData: FormCred;
	setFormData: React.Dispatch<React.SetStateAction<FormCred>>;
	isLoading: boolean;
	isSaving: boolean;
	save: () => Promise<void>;
	resetToSaved: () => Promise<void>;
};

function readFromStorage(): Promise<Partial<FormCred> | null> {
	return new Promise((resolve) => {
		try {
			chrome.storage.local.get([CREDENTIALS_STORAGE_KEY], (result) => {
				if (chrome.runtime?.lastError) {
					console.error(
						"[Reddix credentials] read error:",
						chrome.runtime.lastError.message,
					);
					resolve(null);
					return;
				}
				resolve((result?.[CREDENTIALS_STORAGE_KEY] as Partial<FormCred>) ?? null);
			});
		} catch (error) {
			console.error("[Reddix credentials] read exception:", error);
			resolve(null);
		}
	});
}

function writeToStorage(data: FormCred): Promise<void> {
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.local.set({ [CREDENTIALS_STORAGE_KEY]: data }, () => {
				if (chrome.runtime?.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
					return;
				}
				resolve();
			});
		} catch (error) {
			reject(error);
		}
	});
}

function sanitize(data: Partial<FormCred> | null | undefined): FormCred {
	return {
		provider: "groq",
		endpoint: data?.endpoint?.trim() || DEFAULT_FORM_CRED.endpoint,
		apiKey: data?.apiKey?.trim() || "",
		model: data?.model?.trim() || DEFAULT_FORM_CRED.model,
	};
}

export function useForm(): UseFormResult {
	const [formData, setFormData] = useState<FormCred>(DEFAULT_FORM_CRED);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const loadSaved = useCallback(async () => {
		setIsLoading(true);
		const saved = await readFromStorage();
		setFormData(sanitize(saved));
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void loadSaved();
	}, [loadSaved]);

	const save = useCallback(async () => {
		setIsSaving(true);
		const payload = sanitize(formData);
		await writeToStorage(payload);
		setFormData(payload);
		setIsSaving(false);
	}, [formData]);

	const resetToSaved = useCallback(async () => {
		const saved = await readFromStorage();
		setFormData(sanitize(saved));
	}, []);

	return useMemo(
		() => ({
			formData,
			setFormData,
			isLoading,
			isSaving,
			save,
			resetToSaved,
		}),
		[formData, isLoading, isSaving, save, resetToSaved],
	);
}
