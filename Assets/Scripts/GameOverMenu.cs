using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class GameOverMenu : MonoBehaviour
{
    // UI
    [Header("UI")]
    public Button playButton;
    public Button instructionsButton;
    public Button recordManagementButton;
    public Button quitButton;

    // Start is called before the first frame update
    void Start()
    {
        // Set up button listeners
        playButton.onClick.AddListener(Play);
        instructionsButton.onClick.AddListener(Instructions);
        recordManagementButton.onClick.AddListener(RecordsManagement);
        quitButton.onClick.AddListener(OnApplicationQuit);
    }

    // Loading game space when play button is pressed
    public void Play()
    {
        SceneManager.LoadScene("Main Menu");
    }

    // Loads instructions scene when button is pressed
    public void Instructions()
    {
        SceneManager.LoadScene("Instructions");
    }

    // Loads records management overview scene when button is pressed
    public void RecordsManagement()
    {
        SceneManager.LoadScene("Records Management Overview");
    }

    // On click, application ends
    public void OnApplicationQuit()
    {
        Application.Quit();
    }
}