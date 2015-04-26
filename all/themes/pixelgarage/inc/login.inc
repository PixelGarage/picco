<?php
/**
 * Adapts the login / register / password forms to a more user-friendly style.
 *
 * User: ralph
 * Date: 06.02.15
 * Time: 16:52
 */

function pg_login_preprocess_page(&$vars) {
  // hide title for user registration / login
  switch (current_path()) {
    case 'user':
    case 'user/login':
    case 'user/register':
    case 'user/password':
      $vars['title'] = '';
  }

}

/**
 * Alters the menu entries.
 * @param $items
 */
function pg_login_menu_alter(&$items) {
  // remove the tabs on the login / register form page
  $items['user/login']['type'] = MENU_CALLBACK;
  $items['user/register']['type'] = MENU_CALLBACK;
  $items['user/password']['type'] = MENU_CALLBACK;
}

/**
 * Alter the user login form.
 * @param $form
 * @param $form_state
 * @param $form_id
 */
function pixelgarage_form_user_login_alter(&$form, &$form_state, $form_id) {
  $form['name']['#prefix']  = '<div id="' . $form_id . '_form">';
  $form['name']['#prefix'] .= '<h1>' . t('Login') . '</h1>';
  $form['pass']['#suffix']  = '<div class="form-actions-wrapper">';
  $form['pass']['#suffix'] .= l(t('Forgot your password?'), 'user/password', array('attributes' => array('class' => array('login-password'), 'title' => t('Get a new password'))));
  $form['actions']['#suffix']  = '</div></div>';
  if (variable_get('user_register', USER_REGISTER_VISITORS_ADMINISTRATIVE_APPROVAL) != USER_REGISTER_ADMINISTRATORS_ONLY) {
    $form['actions']['#suffix'] .= '<div id="user-create-account" class="create-account clearfix">';
    $form['actions']['#suffix'] .= "\n<h2>" . t('I don\'t have an account') . "</h2>";
    $form['actions']['#suffix'] .= "\n<div class='create-account-description'><p>" . t("To use this website you need to register.\r Press the button below to apply for an account.") . "</p>";
    $form['actions']['#suffix'] .= "\n<p>" . t("After the processing of your application you will receive an email with detailed information about the login.") . "</p></div>";
    $form['actions']['#suffix'] .= "\n<div class='form-actions-wrapper'>" . l(t('Create an account'), 'user/register', array('attributes' => array('class' => array('login-register'), 'title' => t('Create a new account'))));
    $form['actions']['#suffix'] .= '</div></div>';
  }
}


/**
 * Alter the user registration form.
 * @param $form
 * @param $form_state
 * @param $form_id
 */
function pixelgarage_form_user_register_form_alter (&$form, &$form_state, $form_id) {
  $form['account']['name']['#prefix'] = '<div id="' . $form_id . '">';
  $form['account']['name']['#prefix'] .= '<h1>' . t('Register') . '</h1>';
  $form['actions']['submit']['#suffix'] = '<div class="back-to-login clearfix">' . l(t('Back to login'), 'user/login', array('attributes' => array('class' => array('login-account'), 'title' => t('Sign in')))) . '</div>';
  $form['actions']['submit']['#suffix'] .= '</div>';
}

/**
 * Alter the user password form.
 * @param $form
 * @param $form_state
 * @param $form_id
 */
function pixelgarage_form_user_pass_alter (&$form, &$form_state, $form_id) {
  $form['name']['#prefix'] = '<div id="' . $form_id . '_form">';
  $form['name']['#prefix'] .= '<h1>' . t('Request a new password') . '</h1>';
  $form['actions']['submit']['#suffix'] = '<div class="back-to-login clearfix">' . l(t('Back to login'), 'user/login', array('attributes' => array('class' => array('login-account'), 'title' => t('Sign in')))) . '</div>';
  $form['actions']['submit']['#suffix'] .= '</div>';
}

