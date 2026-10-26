"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ImagePlus, LoaderCircle, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatConfidence, getPredictionFields, useCreateScreeningMutation, useUploadScreeningImageMutation, type ScreeningRecord } from "@/redux/api/screeningApi";
import styles from "./page.module.css";

const durationOptions = [
  "Less than 1 week",
  "1-4 weeks",
  "More than 1 month",
] as const;

const bodyAreas = [
  "Face",
  "Scalp",
  "Neck",
  "Arms",
  "Hands",
  "Chest",
  "Back",
  "Legs",
  "Feet",
  "Other",
] as const;

const yesNoOptions = ["Yes", "No"] as const;

type YesNo = (typeof yesNoOptions)[number];
type DurationOption = (typeof durationOptions)[number];
type BodyArea = (typeof bodyAreas)[number];

type ScreeningFormState = {
  mainSymptom: string;
  bodyArea: BodyArea | "";
  duration: DurationOption | "";
  itching: YesNo | "";
  pain: YesNo | "";
  redness: YesNo | "";
  worsening: YesNo | "";
  feverOrOtherSymptoms: string;
  knownAllergies: string;
  medicalContext: string;
  notes: string;
};

type DemoResult = {
  title: string;
  summary: string;
  confidence: string;
  urgencyLabel: string;
  isUrgent: boolean;
  showSuggestions: boolean;
  suggestions: string[];
};

const initialFormState: ScreeningFormState = {
  mainSymptom: "",
  bodyArea: "",
  duration: "",
  itching: "",
  pain: "",
  redness: "",
  worsening: "",
  feverOrOtherSymptoms: "",
  knownAllergies: "",
  medicalContext: "",
  notes: "",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function NewSkinScreeningPage() {
  const [formData, setFormData] = useState<ScreeningFormState>(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ScreeningFormState, string>>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [requestError, setRequestError] = useState("");
  const [createScreening, createState] = useCreateScreeningMutation();
  const [uploadImage, uploadState] = useUploadScreeningImageMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleInputChange = (field: keyof ScreeningFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.includes("jpeg") && !file.type.includes("png")) {
      setSelectedFile(null);
      setImageError("Please choose a JPG or PNG image under 10 MB.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setImageError("The image must be 10 MB or smaller.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setImageError("");
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof ScreeningFormState, string>> = {};

    if (!formData.mainSymptom.trim()) {
      nextErrors.mainSymptom = "Please describe the main symptom or concern.";
    }

    if (!formData.bodyArea) {
      nextErrors.bodyArea = "Please choose the affected area.";
    }

    if (!formData.duration) {
      nextErrors.duration = "Please estimate how long it has been present.";
    }

    if (!formData.itching) {
      nextErrors.itching = "Please tell us if itching is present.";
    }

    if (!formData.pain) {
      nextErrors.pain = "Please tell us if there is pain or tenderness.";
    }

    if (!formData.redness) {
      nextErrors.redness = "Please tell us if there is redness or swelling.";
    }

    if (!formData.worsening) {
      nextErrors.worsening = "Please tell us if it is spreading or getting worse.";
    }

    if (!selectedFile || imageError) {
      setImageError(imageError || "Please upload a valid JPG or PNG image.");
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedFile || imageError) {
      return;
    }

    setIsAnalyzing(true);
    setDemoResult(null);
    setRequestError("");
    try {
      const symptoms = [formData.mainSymptom, `Area: ${formData.bodyArea}`, `Duration: ${formData.duration}`, formData.notes].filter(Boolean).join(". ");
      const created = await createScreening({ symptoms, hasBleeding: false, rapidGrowth: formData.worsening === "Yes", hasFever: formData.feverOrOtherSymptoms.toLowerCase().includes("fever"), hasUlceration: false, severePain: formData.pain === "Yes" }).unwrap();
      const screeningId = created.data.screeningId ?? created.data.id;
      if (!screeningId) throw new Error("The screening API did not return a screening ID.");
      const uploaded = await uploadImage({ screeningId, imageType: "FRONT", image: selectedFile }).unwrap();
      const data: ScreeningRecord = uploaded.data;
      const prediction = getPredictionFields(data);
      const risk = String(data.riskLevel ?? "").toUpperCase();
      setDemoResult({ title: prediction.condition === "Analysis pending" ? "Screening complete" : prediction.condition, summary: data.symptoms ?? "The screening was processed successfully. Open the report from screening history for full details.", confidence: formatConfidence(prediction.confidence), urgencyLabel: risk === "HIGH" ? "The screening is marked high risk. Seek prompt clinical review." : "Follow the care guidance in the screening report.", isUrgent: risk === "HIGH", showSuggestions: false, suggestions: [] });
    } catch (error) {
      if (error instanceof Error) setRequestError(error.message);
      else if (typeof error === "object" && error && "data" in error && typeof error.data === "object" && error.data && "message" in error.data && typeof error.data.message === "string") setRequestError(error.data.message);
      else setRequestError("The screening could not be completed. Please try again.");
    } finally { setIsAnalyzing(false); }
  };

  const handleReset = () => {
    cleanupPreview();
    setFormData(initialFormState);
    setErrors({});
    setImageError("");
    setDemoResult(null);
  };

  const requiredFieldsComplete =
    Boolean(formData.mainSymptom.trim()) &&
    Boolean(formData.bodyArea) &&
    Boolean(formData.duration) &&
    Boolean(formData.itching) &&
    Boolean(formData.pain) &&
    Boolean(formData.redness) &&
    Boolean(formData.worsening) &&
    Boolean(selectedFile) &&
    !imageError;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Link href="/patient/dashboard" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <div>
          <p className={styles.eyebrow}>Skin screening</p>
          <h1>New Skin Screening</h1>
        </div>
      </header>

      <p className={styles.pageDescription}>
        This tool provides preliminary screening support only and cannot diagnose skin conditions.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Upload</p>
              <h2>Skin image</h2>
            </div>
          </div>

          <div className={styles.uploadBox}>
            <label className={styles.uploadZone} htmlFor="skin-image-input">
              <input
                id="skin-image-input"
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleFileSelection}
                aria-label="Upload skin image"
              />
              <span className={styles.uploadIcon}>
                <ImagePlus size={18} />
              </span>
              <span className={styles.uploadTitle}>Drag and drop a skin image here</span>
              <span className={styles.uploadHint}>JPG or PNG only · Max 10 MB</span>
              <span className={styles.browseButton}>Browse Files</span>
            </label>

            {previewUrl ? (
              <div className={styles.previewWrap}>
                <img src={previewUrl} alt="Selected skin preview" className={styles.previewImage} />
                <div className={styles.previewActions}>
                  <button type="button" className={styles.linkButton} onClick={cleanupPreview}>
                    Remove Image
                  </button>
                  <label className={styles.linkButton} htmlFor="skin-image-input">
                    Replace Image
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          <p className={styles.infoText}>
            A clear, well-lit image without filters is preferred. In a real service, uploaded images would be handled according to privacy safeguards and only used to support clinical workflows.
          </p>
          {imageError ? <p className={styles.errorText}>{imageError}</p> : null}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Symptoms</p>
              <h2>Health context</h2>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.fieldFull}>
              <span>Main symptom or concern</span>
              <input
                type="text"
                value={formData.mainSymptom}
                onChange={(event) => handleInputChange("mainSymptom", event.target.value)}
                aria-invalid={Boolean(errors.mainSymptom)}
                placeholder="Examples: rash, itchy spot, raised lesion, redness"
              />
              {errors.mainSymptom ? <small>{errors.mainSymptom}</small> : null}
            </label>

            <label className={styles.field}>
              <span>Affected body area</span>
              <select
                value={formData.bodyArea}
                onChange={(event) => handleInputChange("bodyArea", event.target.value)}
                aria-invalid={Boolean(errors.bodyArea)}
              >
                <option value="">Select area</option>
                {bodyAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {errors.bodyArea ? <small>{errors.bodyArea}</small> : null}
            </label>

            <label className={styles.field}>
              <span>How long has it been present?</span>
              <select
                value={formData.duration}
                onChange={(event) => handleInputChange("duration", event.target.value)}
                aria-invalid={Boolean(errors.duration)}
              >
                <option value="">Select duration</option>
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.duration ? <small>{errors.duration}</small> : null}
            </label>

            <fieldset className={styles.fieldSet}>
              <legend className={styles.fieldLegend}>Itching</legend>
              <div className={styles.choiceGroup}>
                {yesNoOptions.map((option) => (
                  <label key={option} className={styles.choiceOption}>
                    <input
                      type="radio"
                      name="itching"
                      value={option}
                      checked={formData.itching === option}
                      onChange={(event) => handleInputChange("itching", event.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.itching ? <small>{errors.itching}</small> : null}
            </fieldset>

            <fieldset className={styles.fieldSet}>
              <legend className={styles.fieldLegend}>Pain or tenderness</legend>
              <div className={styles.choiceGroup}>
                {yesNoOptions.map((option) => (
                  <label key={option} className={styles.choiceOption}>
                    <input
                      type="radio"
                      name="pain"
                      value={option}
                      checked={formData.pain === option}
                      onChange={(event) => handleInputChange("pain", event.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.pain ? <small>{errors.pain}</small> : null}
            </fieldset>

            <fieldset className={styles.fieldSet}>
              <legend className={styles.fieldLegend}>Redness or swelling</legend>
              <div className={styles.choiceGroup}>
                {yesNoOptions.map((option) => (
                  <label key={option} className={styles.choiceOption}>
                    <input
                      type="radio"
                      name="redness"
                      value={option}
                      checked={formData.redness === option}
                      onChange={(event) => handleInputChange("redness", event.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.redness ? <small>{errors.redness}</small> : null}
            </fieldset>

            <fieldset className={styles.fieldSet}>
              <legend className={styles.fieldLegend}>Is the condition spreading or getting worse?</legend>
              <div className={styles.choiceGroup}>
                {yesNoOptions.map((option) => (
                  <label key={option} className={styles.choiceOption}>
                    <input
                      type="radio"
                      name="worsening"
                      value={option}
                      checked={formData.worsening === option}
                      onChange={(event) => handleInputChange("worsening", event.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.worsening ? <small>{errors.worsening}</small> : null}
            </fieldset>

            <label className={styles.fieldFull}>
              <span>Fever or other symptoms</span>
              <input
                type="text"
                value={formData.feverOrOtherSymptoms}
                onChange={(event) => handleInputChange("feverOrOtherSymptoms", event.target.value)}
                placeholder="Optional: fever, swelling, breathing difficulty, nausea"
              />
            </label>

            <label className={styles.fieldFull}>
              <span>Known allergies</span>
              <input
                type="text"
                value={formData.knownAllergies}
                onChange={(event) => handleInputChange("knownAllergies", event.target.value)}
                placeholder="Optional"
              />
            </label>

            <label className={styles.fieldFull}>
              <span>Existing skin conditions or relevant medical context</span>
              <input
                type="text"
                value={formData.medicalContext}
                onChange={(event) => handleInputChange("medicalContext", event.target.value)}
                placeholder="Optional"
              />
            </label>

            <label className={styles.fieldFull}>
              <span>Additional notes</span>
              <textarea
                value={formData.notes}
                onChange={(event) => handleInputChange("notes", event.target.value)}
                placeholder="Optional details about when it started, any triggers, or other symptoms"
              />
            </label>
          </div>
        </section>

        <section className={styles.warningPanel}>
          <div className={styles.warningHeader}>
            <ShieldAlert size={18} />
            <h3>Safety guidance</h3>
          </div>
          <p>
            These symptoms may need urgent medical attention. Please visit a doctor or emergency service immediately.
          </p>
          <ul>
            <li>Rapidly spreading rash with fever.</li>
            <li>Swelling of the face, lips, or tongue, or breathing difficulty.</li>
            <li>Large blisters or skin peeling.</li>
            <li>Spreading redness with pus, severe pain, or heat.</li>
            <li>A growing, bleeding, or changing mole or spot.</li>
          </ul>
        </section>

        <div className={styles.actionRow}>
          <Button
            type="submit"
            className={styles.primaryButton}
            disabled={isAnalyzing || createState.isLoading || uploadState.isLoading || !requiredFieldsComplete}
          >
            {isAnalyzing ? (
              <>
                <LoaderCircle className={styles.spinner} size={16} />
                Analyzing...
              </>
            ) : (
                "Analyze Skin"
            )}
          </Button>
          <Button type="button" variant="ghost" className={styles.ghostButton} onClick={handleReset}>
            Start New Screening
          </Button>
        </div>

        {requestError ? <p className={styles.errorText} role="alert">{requestError}</p> : null}

      </form>

      {demoResult ? (
        <section className={styles.resultCard} aria-live="polite">
          <div className={styles.resultHeader}>
            <AlertTriangle size={16} />
            <span>DEMO RESULT — NOT A MEDICAL DIAGNOSIS</span>
          </div>
          <h3>{demoResult.title}</h3>
          <p>{demoResult.summary}</p>
          <div className={styles.confidenceRow}>
            <span>Sample confidence</span>
            <strong>{demoResult.confidence}</strong>
          </div>
          <p className={styles.disclaimerText}>
            This result was returned by the screening service. It is not a diagnosis and does not replace a professional assessment.
          </p>

          {demoResult.isUrgent ? (
            <div className={styles.redFlagBox}>
              <ShieldAlert size={18} />
              <div>
                <strong>Urgent safety warning</strong>
                <p>{demoResult.urgencyLabel}</p>
                <p>For breathing difficulty or severe facial or tongue swelling, seek emergency medical services immediately.</p>
              </div>
            </div>
          ) : null}

          {!demoResult.isUrgent && demoResult.showSuggestions ? (
            <div className={styles.suggestionBox}>
              <h4>Suggested next steps</h4>
              <ul>
                {demoResult.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.resultActions}>
            <Link href="/patient/dashboard" passHref>
              <Button className={styles.primaryButton}>Find a Doctor</Button>
            </Link>
            <Button variant="outline" className={styles.secondaryButton} onClick={handleReset} type="button">
              Start New Screening
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
