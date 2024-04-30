using UnityEngine;

public class AudioManager : MonoBehaviour
{
    // Singleton instance
    public static AudioManager Instance { get; private set; }

    // Audio clips
    public AudioClip theme;
    public AudioClip correctMatchSound;
    public AudioClip incorrectMatchSound;

    // Audio source
    private AudioSource audioSource;

    private void Awake()
    {
        // Ensure only one instance of AudioManager exists
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }

        // Get the audio source component
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            // Add audio source component if not found
            audioSource = gameObject.AddComponent<AudioSource>();
        }
    }

    // Play the main theme
    public void PlayTheme()
    {
        if (theme != null && audioSource != null)
        {
            audioSource.clip = theme;
            audioSource.loop = true;
            audioSource.Play();
        }
        else
        {
            Debug.LogWarning("Theme audio clip or AudioSource component is missing.");
        }
    }
    
    // Play sound for correct match
    public void PlayCorrectMatchSound()
    {
        if (correctMatchSound != null)
        {
            audioSource.PlayOneShot(correctMatchSound);
        }
        else
        {
            Debug.LogWarning("Correct match sound is not assigned!");
        }
    }

    // Play sound for incorrect match
    public void PlayIncorrectMatchSound()
    {
        if (incorrectMatchSound != null)
        {
            audioSource.PlayOneShot(incorrectMatchSound);
        }
        else
        {
            Debug.LogWarning("Incorrect match sound is not assigned!");
        }
    }
}
