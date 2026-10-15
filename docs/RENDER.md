# Host Baghdadia School on Render

This hosts the website and its real Express server together. Your PC does not need to stay on. No database, AI API key, Docker build, or custom domain is needed.

## Deploy

1. Sign in at https://dashboard.render.com/ with your own account.
2. Select **New → Web Service**, connect GitHub and select `baghdadiaschools/Baghdadia-school`. Grant access to this repository if it is private.
3. Select branch **feat/baghdadia-school-app**, runtime **Node**, and these commands:
   - Build: `npm ci --include=dev && npm run build`
   - Start: `npm start`
4. Select the **Free** instance type. Add environment variable `NODE_VERSION` = `22.16.0` and `NODE_ENV` = `production`. Under Advanced set the health check path to `/api/health`. Leave PORT unset: the app uses Render's assigned port.
5. Create the web service. Wait for a successful build and **Live** status, then open the `https://...onrender.com` address shown in your dashboard.

Alternatively, use **New → Blueprint**, select this repository and the same branch, and let Render read `render.yaml`. Confirm the service is Free before creating it. Do not select a paid plan if you want zero hosting charges.

Render has offered free Node web services with HTTPS and an onrender.com subdomain. Free services normally sleep after inactivity and may take about a minute to wake. Usage limits apply. Verify the current Free plan and account requirements in Render's dashboard: provider documentation could not be reached from the build environment, so current terms could not be independently checked. A custom domain is optional and may cost money.

## Check your live website

- `/api/health` should show `{"status":"ok","service":"baghdadia-school"}`.
- `/api/categories` should show exactly eight empty categories and `aiEnabled: false`.
- Open `/homework` directly, then refresh it: the page should still load.
- Switch Arabic/English and light/dark; reload to check preferences.
- Check the original splash video on a fresh tab and install the PWA from the HTTPS site on a supported phone browser.

If the build fails, inspect the service's **Logs**. Confirm the branch and build command above. If a free service takes time on the first request, allow it to wake up. No keep-alive services are necessary.

Later changes pushed to the configured branch can trigger deployment according to your service's auto-deploy setting. To stop hosting, suspend or delete the service from Render's dashboard.

The repository configuration is prepared and locally validated. A public deployment is not complete until your account authorizes the service and Render reports it Live.
