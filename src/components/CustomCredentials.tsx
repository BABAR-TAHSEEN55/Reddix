import { Button } from "@/components/ui/button";
import { FormCred, useForm } from "@/hooks/formData";
import { Key, Settings, Shield } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

const maskApiKey = (key: string) => {
	if (!key) return "Not set";
	if (key.length <= 8) return "••••••••";
	return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
};

export function CustomCredentials() {
	const { formData, setFormData, isLoading, isSaving, save, resetToSaved } =
		useForm();

	// Comments.tsx dark theme palette (exact)
	const themeClasses = {
		bg: "bg-[#1c1c1c]",
		surface: "bg-[#242422]",
		text: "text-[#f0ede6]",
		textMuted: "text-[#a8a4a0]",
		border: "border-[#3a3835]",
		accent: "text-[#9aaa8e]",
		accentBg: "bg-[#2a2d28]",
		copper: "text-[#c9a87c]",
		copperBg: "bg-[#3d3226]",
		amber: "text-[#f0c98e]",
		inputBg: "bg-[#242422]",
		placeholder: "placeholder-[#6b6864]",
		hover: "hover:bg-[#2a2826]",
		ring: "focus:ring-[#7a8471]/30",
	};

	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev: FormCred) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.apiKey.trim()) {
			toast.error("Please enter your Groq API key.");
			return;
		}

		if (!formData.apiKey.startsWith("gsk_")) {
			toast.error("Groq API keys usually start with 'gsk_'.");
			return;
		}

		try {
			await save();
			toast.success("Groq credentials saved successfully.");
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : "Failed to save credentials.";
			toast.error(msg);
		}
	};

	const handleCancel = async () => {
		await resetToSaved();
		toast("Reverted to last saved credentials.");
	};

	if (isLoading) {
		return (
			<div className={`w-[400px] max-w-md mx-auto p-6 ${themeClasses.bg}`}>
				<div
					className={`rounded-lg border ${themeClasses.surface} ${themeClasses.border} p-6 shadow-sm`}
				>
					<p className={`text-sm ${themeClasses.textMuted} font-serif`}>
						Loading saved credentials...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`w-[400px] max-w-md mx-auto space-y-8 p-4 ${themeClasses.bg}`}
		>
			<div className="space-y-2 text-center">
				<div className="flex justify-center">
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-full ${themeClasses.accentBg} border ${themeClasses.border}`}
					>
						<Settings className={`h-6 w-6 ${themeClasses.accent}`} />
					</div>
				</div>
				<h1
					className={`text-2xl font-semibold tracking-tight font-serif ${themeClasses.text}`}
				>
					Groq Configuration
				</h1>
				<p className={`text-sm ${themeClasses.textMuted}`}>
					Configure your Groq API credentials
				</p>
			</div>

			<div
				className={`rounded-lg border ${themeClasses.surface} ${themeClasses.border} p-6 shadow-sm`}
			>
				<form className="space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-5">
						<div className="space-y-2">
							<label
								htmlFor="apiKey"
								className={`text-sm font-medium flex items-center gap-2 ${themeClasses.text}`}
							>
								<Key className={`h-4 w-4 ${themeClasses.copper}`} />
								Groq API Key
							</label>
							<input
								id="apiKey"
								name="apiKey"
								onChange={handleFormChange}
								value={formData.apiKey}
								type="password"
								placeholder="gsk_..."
								className={`w-full h-10 rounded-md border ${themeClasses.inputBg} ${themeClasses.border} px-3 text-sm font-mono ${themeClasses.text} ${themeClasses.placeholder} outline-none focus:ring-2 ${themeClasses.ring}`}
							/>
							<p
								className={`text-xs ${themeClasses.textMuted} flex items-center gap-1.5`}
							>
								<Shield className={`h-3 w-3 ${themeClasses.accent}`} />
								Stored locally in your browser extension storage.
							</p>
						</div>

						<div
							className={`rounded-md border ${themeClasses.copperBg} ${themeClasses.border} p-3 text-xs ${themeClasses.textMuted}`}
						>
							<span className={`font-medium ${themeClasses.copper}`}>
								Saved key preview:
							</span>{" "}
							<span className={themeClasses.text}>{maskApiKey(formData.apiKey)}</span>
						</div>

						<div className="flex gap-3 pt-1">
							<Button
								type="submit"
								className={`flex-1 ${themeClasses.copper} ${themeClasses.copperBg} border ${themeClasses.border} ${themeClasses.hover} transition-all duration-200`}
								disabled={isSaving}
							>
								{isSaving ? "Saving..." : "Save Configuration"}
							</Button>
							<Button
								variant="outline"
								type="button"
								className={`flex-1 border ${themeClasses.border} ${themeClasses.text} ${themeClasses.hover} bg-transparent transition-all duration-200`}
								onClick={handleCancel}
								disabled={isSaving}
							>
								Cancel
							</Button>
						</div>
					</div>
				</form>
			</div>

			<p className={`text-center text-xs ${themeClasses.textMuted}`}>
				Provider is currently fixed to{" "}
				<span className={`font-medium ${themeClasses.text}`}>Groq</span>.
				Multi-provider support will be added later.
			</p>
		</div>
	);
}

export default CustomCredentials;
