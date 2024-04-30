using System.Collections;
using UnityEngine;

/// <summary>
/// Script defines a simple screen shake effect, shaking the camera on the x and y axes for a short duration
/// Script is attached to our camera object and the effect triggers when a player scores
/// In order to trigger the method needs to be called as a coroutine from our scoring script
/// </summary>

public class ScreenShake : MonoBehaviour
{
    [Header("Camera Variable")]
    // Variables that adjust shake effect
    public float shakeDuration = 0.15f;
    public float shakeMagnitude = 0.2f;

    // Original Camera Position
    private Vector3 originalPosition;

    // Start is called before the first frame update
    void Start()
    {
        originalPosition = transform.position;
    }

    public IEnumerator Shake()
    {
        float elapsed = 0.0f;

        while (elapsed < shakeDuration)
        {
            float x = Random.Range(-1f, 1f) * shakeMagnitude;
            float y = Random.Range(-1f, 1f) * shakeDuration;

            transform.position = new Vector3(originalPosition.x = x, originalPosition.y + y, originalPosition.z);

            elapsed += Time.deltaTime;

            yield return null;
        }

        transform.position = originalPosition;
    }
 
}
